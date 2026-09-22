import axios from "axios";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";
import {
  analyserSujet,
  filtrerQuestionsLiees,
} from "@/lib/quiz-relevance";
import type { QuestionTrivia } from "@/lib/quiz-relevance";
import {
  deeplEstConfigure,
  traduireVersFrancais,
} from "@/lib/deepl";

export async function POST(request: Request) {
  try {
    const utilisateur = obtenirUtilisateur(request);

    if (!utilisateur) {
      return NextResponse.json(
        { erreur: "Token manquant ou invalide" },
        { status: 401 },
      );
    }

    if (utilisateur.role !== "ETUDIANT") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { coursId } = body;

    if (!coursId) {
      return NextResponse.json(
        { erreur: "coursId obligatoire" },
        { status: 400 },
      );
    }

    const cours = await prisma.cours.findUnique({
      where: {
        id: coursId,
      },
      include: {
        lecons: {
          select: {
            titre: true,
          },
        },
      },
    });

    if (!cours) {
      return NextResponse.json(
        { erreur: "Cours introuvable" },
        { status: 404 },
      );
    }

    const inscription = await prisma.inscription.findFirst({
      where: {
        etudiantId: utilisateur.id,
        coursId,
      },
    });

    if (!inscription) {
      return NextResponse.json(
        { erreur: "Vous devez etre inscrit a ce cours" },
        { status: 403 },
      );
    }

    const sujet = analyserSujet(cours);
    const triviaUrl = process.env.TRIVIA_API_URL || process.env.TRIVIA_API || "https://opentdb.com/api.php";
    const reponseApi = await axios.get<{ response_code: number; results: QuestionTrivia[] }>(
      triviaUrl,
      {
        params: {
          amount: 20,
          type: "multiple",
          ...(sujet.categorie && { category: sujet.categorie.id }),
        },
        timeout: 8000,
      },
    );

    if (reponseApi.data.response_code !== 0) {
      return NextResponse.json(
        { erreur: "L'API de questions n'a pas fourni de résultats valides" },
        { status: 502 },
      );
    }

    if (!deeplEstConfigure()) {
      return NextResponse.json(
        { erreur: "La traduction DeepL n'est pas configurée sur le serveur" },
        { status: 503 },
      );
    }

    const questionsLiees = filtrerQuestionsLiees(reponseApi.data.results, sujet).slice(0, 5);

    if (questionsLiees.length < 5) {
      return NextResponse.json(
        {
          erreur: sujet.categorie
            ? `L'API n'a pas fourni assez de questions liées à la catégorie ${sujet.categorie.nom}.`
            : "L'API n'a pas fourni assez de questions liées au sujet du cours.",
        },
        { status: 422 },
      );
    }

    const textesATraduire = questionsLiees.flatMap((question) => [
      question.question as string,
      question.correct_answer as string,
      ...(question.incorrect_answers as string[]),
    ]);
    const textesTraduits = await traduireVersFrancais(textesATraduire);
    let indexTraduction = 0;

    const questionsTraduites = questionsLiees.map(() => {
      const question = {
        question: textesTraduits[indexTraduction],
        correct_answer: textesTraduits[indexTraduction + 1],
        incorrect_answers: textesTraduits.slice(
          indexTraduction + 2,
          indexTraduction + 5,
        ),
      };

      indexTraduction += 5;
      return question;
    });

    const quiz = await prisma.$transaction(async (transaction) => {
      const nouveauQuiz = await transaction.quiz.create({
        data: {
          coursId,
          etudiantId: utilisateur.id,
        },
      });

      await transaction.question.createMany({
        data: questionsTraduites.map((questionApi) => ({
          enonce: questionApi.question,
          bonneReponse: questionApi.correct_answer,
          mauvaisesReponses: questionApi.incorrect_answers,
          quizId: nouveauQuiz.id,
        })),
      });

      return transaction.quiz.findUnique({
        where: {
          id: nouveauQuiz.id,
        },
        include: {
          questions: true,
        },
      });
    });

    const questions = quiz?.questions ?? [];

    return NextResponse.json(
      {
        quiz,
        questions,
      },
      {
        status: 201,
      },
    );
  } catch (erreur) {
    if (axios.isAxiosError(erreur)) {
      console.error("Erreur d'un service externe de quiz", {
        status: erreur.response?.status,
        message: erreur.message,
      });

      return NextResponse.json(
        { erreur: "Un service externe du quiz est temporairement indisponible" },
        { status: 502 },
      );
    }

    console.error(erreur instanceof Error ? erreur.message : erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
