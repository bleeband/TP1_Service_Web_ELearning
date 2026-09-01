import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

export async function GET(request: Request) {
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

    const quiz = await prisma.quiz.findMany({
      where: {
        etudiantId: utilisateur.id,
      },
      include: {
        cours: true,
        questions: true,
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return NextResponse.json(quiz);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
