import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, motDePasse, nom } = body;

    if (!email || !motDePasse || !nom) {
      return NextResponse.json(
        { message: "Email, mot de passe et nom obligatoires" },
        { status: 400 },
      );
    }

    const utilisateurExiste = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (utilisateurExiste) {
      return NextResponse.json(
        { message: "Cet email est deja utilise" },
        { status: 400 },
      );
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    const utilisateur = await prisma.utilisateur.create({
      data: {
        email,
        motDePasseHash,
        nom,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        dateCreation: true,
      },
    });

    return NextResponse.json(utilisateur, {
      status: 201,
    });
  } catch (erreur) {
    console.error(erreur);

    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
