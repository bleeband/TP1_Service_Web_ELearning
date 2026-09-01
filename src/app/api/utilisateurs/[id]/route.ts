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
    const utilisateurConnecte = obtenirUtilisateur(request);

    if (!utilisateurConnecte) {
      return NextResponse.json(
        { erreur: "Token manquant ou invalide" },
        { status: 401 },
      );
    }

    if (utilisateurConnecte.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id } = await contexte.params;
    const utilisateurId = Number(id);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: {
        id: utilisateurId,
      },
      omit: {
        motDePasseHash: true,
      },
    });

    if (!utilisateur) {
      return NextResponse.json(
        { erreur: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json(utilisateur);
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
    const utilisateurConnecte = obtenirUtilisateur(request);

    if (!utilisateurConnecte) {
      return NextResponse.json(
        { erreur: "Token manquant ou invalide" },
        { status: 401 },
      );
    }

    if (utilisateurConnecte.role !== "ADMIN") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id } = await contexte.params;
    const utilisateurId = Number(id);

    const utilisateurExiste = await prisma.utilisateur.findUnique({
      where: {
        id: utilisateurId,
      },
    });

    if (!utilisateurExiste) {
      return NextResponse.json(
        { erreur: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    await prisma.utilisateur.delete({
      where: {
        id: utilisateurId,
      },
    });

    return NextResponse.json({
      message: "Utilisateur supprime",
    });
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
