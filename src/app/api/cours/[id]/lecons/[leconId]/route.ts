import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

type ContexteRoute = {
  params: Promise<{
    id: string;
    leconId: string;
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

    if (utilisateur.role !== "FORMATEUR" && utilisateur.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id: coursId, leconId } = await contexte.params;
    const id = Number(leconId);

    const body = await request.json();
    const { titre, contenu, ordre } = body;

    const leconExiste = await prisma.lecon.findUnique({
      where: { id },
      include: {
        cours: {
          select: {
            id: true,
            formateurId: true,
          },
        },
      },
    });

    if (!leconExiste) {
      return NextResponse.json(
        { erreur: "Lecon introuvable" },
        { status: 404 },
      );
    }

    if (
      leconExiste.cours.id !== Number(coursId) ||
      (utilisateur.role !== "ADMIN" &&
        leconExiste.cours.formateurId !== utilisateur.id)
    ) {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const lecon = await prisma.lecon.update({
      where: { id },
      data: {
        titre,
        contenu,
        ordre,
      },
    });

    return NextResponse.json(lecon);
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

    if (utilisateur.role !== "FORMATEUR" && utilisateur.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id: coursId, leconId } = await contexte.params;
    const id = Number(leconId);

    const leconExiste = await prisma.lecon.findUnique({
      where: { id },
      include: {
        cours: {
          select: {
            id: true,
            formateurId: true,
          },
        },
      },
    });

    if (!leconExiste) {
      return NextResponse.json(
        { erreur: "Lecon introuvable" },
        { status: 404 },
      );
    }

    if (
      leconExiste.cours.id !== Number(coursId) ||
      (utilisateur.role !== "ADMIN" &&
        leconExiste.cours.formateurId !== utilisateur.id)
    ) {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    await prisma.lecon.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Lecon supprimee",
    });
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
