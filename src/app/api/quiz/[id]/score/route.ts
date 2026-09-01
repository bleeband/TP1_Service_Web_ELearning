import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

type ContexteRoute = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  contexte: ContexteRoute,
) {
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

    const { id } = await contexte.params;
    const quizId = Number(id);

    const body = await request.json();
    const { score } = body;

    if (score === undefined) {
      return NextResponse.json(
        { erreur: "Score obligatoire" },
        { status: 400 },
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { erreur: "Le score doit etre entre 0 et 100" },
        { status: 400 },
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { erreur: "Quiz introuvable" },
        { status: 404 },
      );
    }

    if (quiz.etudiantId !== utilisateur.id) {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const quizModifie = await prisma.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        score,
      },
    });

    return NextResponse.json(quizModifie);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
