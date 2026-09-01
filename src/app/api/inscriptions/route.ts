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

    const inscriptions = await prisma.inscription.findMany({
      where: {
        etudiantId: utilisateur.id,
      },
      include: {
        cours: true,
      },
    });

    return NextResponse.json(inscriptions);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}

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

    const inscriptionExiste = await prisma.inscription.findFirst({
      where: {
        etudiantId: utilisateur.id,
        coursId,
      },
    });

    if (inscriptionExiste) {
      return NextResponse.json(
        { erreur: "Etudiant deja inscrit a ce cours" },
        { status: 400 },
      );
    }

    const inscription = await prisma.inscription.create({
      data: {
        etudiantId: utilisateur.id,
        coursId,
      },
    });

    return NextResponse.json(inscription, {
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
