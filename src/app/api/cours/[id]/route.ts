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
    const { id } = await contexte.params;
    const coursId = Number(id);

    const cours = await prisma.cours.findUnique({
      where: {
        id: coursId,
      },
      include: {
        formateur: {
          omit: {
            motDePasseHash: true,
          },
        },
        lecons: {
          orderBy: {
            ordre: "asc",
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

    return NextResponse.json(cours);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}

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

    if (utilisateur.role !== "FORMATEUR") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id } = await contexte.params;
    const coursId = Number(id);

    const body = await request.json();
    const { titre, description, niveau } = body;

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

    const cours = await prisma.cours.update({
      where: {
        id: coursId,
      },
      data: {
        titre,
        description,
        niveau,
      },
    });

    return NextResponse.json(cours);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    if (utilisateur.role !== "FORMATEUR") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id } = await contexte.params;
    const coursId = Number(id);

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

    await prisma.cours.delete({
      where: {
        id: coursId,
      },
    });

    return NextResponse.json({
      message: "Cours supprime",
    });
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
