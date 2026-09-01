import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { obtenirUtilisateur } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const niveau = searchParams.get("niveau");
    const recherche = searchParams.get("recherche");

    const pageValide = page > 0 ? page : 1;
    const limitValide = limit > 0 ? limit : 10;

    const where = {
      ...(niveau && {
        niveau: niveau as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
      }),

      ...(recherche && {
        titre: {
          contains: recherche,
          mode: "insensitive" as const,
        },
      }),
    };

    const cours = await prisma.cours.findMany({
      where,
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
      skip: (pageValide - 1) * limitValide,
      take: limitValide,
      orderBy: {
        dateCreation: "desc",
      },
    });

    const total = await prisma.cours.count({
      where,
    });

    return NextResponse.json({
      cours,
      page: pageValide,
      limit: limitValide,
      total,
      totalPages: Math.ceil(total / limitValide),
    });
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

    if (utilisateur.role !== "FORMATEUR") {
      return NextResponse.json(
        { erreur: "Acces refuse" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { titre, description, niveau } = body;

    if (!titre || !description || !niveau) {
      return NextResponse.json(
        {
          erreur: "Titre, description et niveau obligatoires",
        },
        { status: 400 },
      );
    }

    const cours = await prisma.cours.create({
      data: {
        titre,
        description,
        niveau,
        formateurId: utilisateur.id,
      },
    });

    return NextResponse.json(cours, {
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
