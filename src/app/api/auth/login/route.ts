import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import { creerToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, motDePasse } = body;

    if (!email || !motDePasse) {
      return NextResponse.json(
        { message: "Email et mot de passe obligatoires" },
        { status: 400 },
      );
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!utilisateur) {
      return NextResponse.json(
        { message: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const motDePasseValide = await bcrypt.compare(
      motDePasse,
      utilisateur.motDePasseHash,
    );

    if (!motDePasseValide) {
      return NextResponse.json(
        { message: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const token = creerToken({
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    });

    return NextResponse.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        role: utilisateur.role,
      },
    });
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
