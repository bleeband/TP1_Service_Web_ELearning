import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

const STATUTS = ["ACTIVE", "TERMINEE", "ABANDONNEE"] as const;
type Statut = (typeof STATUTS)[number];

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

    if (utilisateur.role !== "FORMATEUR") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const { id } = await contexte.params;
    const inscriptionId = Number(id);

    if (!Number.isInteger(inscriptionId) || inscriptionId <= 0) {
      return NextResponse.json(
        { erreur: "Identifiant d'inscription invalide" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const statut = body?.statut as string | undefined;

    if (!statut || !STATUTS.includes(statut as Statut)) {
      return NextResponse.json(
        { erreur: "Statut invalide" },
        { status: 400 },
      );
    }

    const inscription = await prisma.inscription.findUnique({
      where: {
        id: inscriptionId,
      },
      include: {
        cours: {
          select: {
            formateurId: true,
          },
        },
      },
    });

    if (!inscription) {
      return NextResponse.json(
        { erreur: "Inscription introuvable" },
        { status: 404 },
      );
    }

    if (inscription.cours.formateurId !== utilisateur.id) {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const inscriptionMiseAJour = await prisma.inscription.update({
      where: {
        id: inscriptionId,
      },
      data: {
        statut: statut as Statut,
      },
    });

    return NextResponse.json(inscriptionMiseAJour);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
