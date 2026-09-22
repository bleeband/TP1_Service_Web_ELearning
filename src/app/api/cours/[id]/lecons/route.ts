import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

type ContexteRoute = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
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

    const { id } = await contexte.params;
    const coursId = Number(id);

    const cours = await prisma.cours.findUnique({
      where: {
        id: coursId,
      },
      select: {
        formateurId: true,
      },
    });

    if (!cours) {
      return NextResponse.json(
        { erreur: "Cours introuvable" },
        { status: 404 },
      );
    }

    let autorise = utilisateur.role === "ADMIN";

    if (utilisateur.role === "FORMATEUR") {
      autorise = cours.formateurId === utilisateur.id;
    }

    if (utilisateur.role === "ETUDIANT") {
      const inscription = await prisma.inscription.findUnique({
        where: {
          etudiantId_coursId: {
            etudiantId: utilisateur.id,
            coursId,
          },
        },
      });

      autorise = Boolean(inscription);
    }

    if (!autorise) {
      return NextResponse.json(
        { erreur: "Vous n'avez pas acces aux lecons de ce cours" },
        { status: 403 },
      );
    }

    const lecons = await prisma.lecon.findMany({
      where: {
        coursId,
      },
      orderBy: {
        ordre: "asc",
      },
    });

    return NextResponse.json(lecons);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function POST(
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

    if (utilisateur.role !== "FORMATEUR" && utilisateur.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id } = await contexte.params;
    const coursId = Number(id);

    const body = await request.json();
    const { titre, contenu, ordre } = body;

    if (!titre || !contenu || ordre === undefined) {
      return NextResponse.json(
        {
          erreur: "Titre, contenu et ordre obligatoires",
        },
        { status: 400 },
      );
    }

    const coursExiste = await prisma.cours.findUnique({
      where: {
        id: coursId,
      },
    });

    if (!coursExiste) {
      return NextResponse.json(
        { erreur: "Cours introuvable" },
        { status: 404 },
      );
    }

    if (
      utilisateur.role !== "ADMIN" &&
      coursExiste.formateurId !== utilisateur.id
    ) {
      return NextResponse.json(
        { erreur: "Acces refuse : vous ne pouvez gerer que vos propres cours" },
        { status: 403 },
      );
    }

    const lecon = await prisma.lecon.create({
      data: {
        titre,
        contenu,
        ordre,
        coursId,
      },
    });

    return NextResponse.json(lecon, {
      status: 201,
    });
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
