import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

export async function GET(request: Request) {
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

    const utilisateurs = await prisma.utilisateur.findMany({
      omit: {
        motDePasseHash: true,
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return NextResponse.json(utilisateurs);
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 },
    );
  }
}
