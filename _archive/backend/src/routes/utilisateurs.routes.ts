import { Router, type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { authentifier, exigerRole } from "../middlewares/auth.middleware.js";
const router = Router();

//afficher tous les utilisateurs
router.get("/", authentifier, exigerRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      omit: {
        motDePasseHash: true,
      },
    });
    res.json(utilisateurs);
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});
//afficher un utilisateur
router.get("/:id", authentifier, exigerRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      omit: {
        motDePasseHash: true,
      },
    });
    if (!utilisateur) {
      res.status(404).json({ erreur: "Utilisateur introuvable" });
      return;
    }
    res.json(utilisateur);
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});
//modifier le role
router.put("/:id/role", authentifier, exigerRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    if (!role) {
      res.status(400).json({ erreur: "Role obligatoire" });
      return;
    }
    if (role !== "ETUDIANT" && role !== "FORMATEUR" && role !== "ADMIN") {
      res.status(400).json({ erreur: "Role invalide" });
      return;
    }
    const utilisateurExiste = await prisma.utilisateur.findUnique({
      where: { id },
    });
    if (!utilisateurExiste) {
      res.status(404).json({ erreur: "Utilisateur introuvable" });
      return;
    }
    const utilisateur = await prisma.utilisateur.update({
      where: { id },
      data: {
        role,
      },
      omit: {
        motDePasseHash: true,
      },
    });
    res.json(utilisateur);
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});

//supprimer un utilisateur
router.delete("/:id", authentifier, exigerRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const utilisateurExiste = await prisma.utilisateur.findUnique({
      where: { id },
    });
    if (!utilisateurExiste) {
      res.status(404).json({ erreur: "Utilisateur introuvable" });
      return;
    }
    await prisma.utilisateur.delete({
      where: { id },
    });
    res.json({ message: "Utilisateur supprime" });
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});
export default router;