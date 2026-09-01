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

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { erreur: "Role obligatoire" },
        { status: 400 },
      );
    }

    if (
      role !== "ETUDIANT" &&
      role !== "FORMATEUR" &&
      role !== "ADMIN"
    ) {
      return NextResponse.json(
        { erreur: "Role invalide" },
        { status: 400 },
      );
    }

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

    const utilisateur = await prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        role,
      },
      omit: {
        motDePasseHash: true,
      },
    });

    return NextResponse.json(utilisateur);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
