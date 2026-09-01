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
    const inscriptionId = Number(id);

    const body = await request.json();
    const { progression } = body;

    if (progression === undefined) {
      return NextResponse.json(
        { erreur: "Progression obligatoire" },
        { status: 400 },
      );
    }

    if (progression < 0 || progression > 100) {
      return NextResponse.json(
        { erreur: "La progression doit etre entre 0 et 100" },
        { status: 400 },
      );
    }

    const inscriptionExiste = await prisma.inscription.findFirst({
      where: {
        id: inscriptionId,
        etudiantId: utilisateur.id,
      },
    });

    if (!inscriptionExiste) {
      return NextResponse.json(
        { erreur: "Inscription introuvable" },
        { status: 404 },
      );
    }

    const inscription = await prisma.inscription.update({
      where: {
        id: inscriptionId,
      },
      data: {
        progression,
      },
    });

    return NextResponse.json(inscription);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
