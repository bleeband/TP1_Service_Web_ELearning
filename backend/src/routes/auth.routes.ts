import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, motDePasse, nom } = req.body;

    if (!email || !motDePasse || !nom) {
      return res.status(400).json({ message: "Email, mot de passe et nom obligatoire" });
    }

    const utilisateurExiste = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (utilisateurExiste) {
      return res.status(400).json({ message: "Cet email est deja utilise" });
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

    res.status(201).json(utilisateur);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires" });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!utilisateur) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);

    if (!motDePasseValide) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET manquant" });
    }

    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        role: utilisateur.role,
      },
    });
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;