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

    if (utilisateur.role !== "FORMATEUR") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const inscriptions = await prisma.inscription.findMany({
      where: {
        cours: {
          formateurId: utilisateur.id,
        },
      },
      select: {
        id: true,
        statut: true,
        progression: true,
        dateInscription: true,
        cours: {
          select: {
            id: true,
            titre: true,
          },
        },
        etudiant: {
          select: {
            id: true,
            nom: true,
            email: true,
          },
        },
      },
      orderBy: {
        dateInscription: "desc",
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
