import axios from "axios";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

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

    const reponseApi = await axios.get(
      `${process.env.TRIVIA_API}?amount=5&type=multiple`,
    );

    const quiz = await prisma.quiz.create({
      data: {
        coursId,
        etudiantId: utilisateur.id,
      },
    });

    for (const questionApi of reponseApi.data.results) {
      await prisma.question.create({
        data: {
          enonce: questionApi.question,
          bonneReponse: questionApi.correct_answer,
          mauvaisesReponses: questionApi.incorrect_answers,
          quizId: quiz.id,
        },
      });
    }

    const questions = await prisma.question.findMany({
      where: {
        quizId: quiz.id,
      },
    });

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
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
