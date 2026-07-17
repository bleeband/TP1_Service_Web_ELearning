import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRole } from "../middlewares/auth.middleware.js";

const router = Router();

//voir inscriptions
router.get(
  "/",
  authentifier,
  exigerRole("ETUDIANT"),
  async (req: Request, res: Response) => {
    try {
      const etudiantId = (req as any).user.id;
      const inscriptions = await prisma.inscription.findMany({
        where: { etudiantId },
        include: {
          cours: true,
        },
      });
      res.json(inscriptions);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

//s'inscrire a un cours
router.post(
  "/",
  authentifier,
  exigerRole("ETUDIANT"),
  async (req: Request, res: Response) => {
    try {
      const etudiantId = (req as any).user.id;
      const { coursId } = req.body;
      if (!coursId) {
        res.status(400).json({ erreur: "coursId obligatoire" });
        return;
      }
      const coursExiste = await prisma.cours.findUnique({
        where: { id: coursId },
      });
      if (!coursExiste) {
        res.status(404).json({ erreur: "Cours introuvable" });
        return;
      }
      const inscriptionExiste = await prisma.inscription.findFirst({
        where: {
          etudiantId,
          coursId,
        },
      });
      if (inscriptionExiste) {
        res.status(400).json({ erreur: "Etudiant deja inscrit a ce cours" });
        return;
      }
      const inscription = await prisma.inscription.create({
        data: {
          etudiantId,
          coursId,
        },
      });
      res.status(201).json(inscription);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

//modifier progression
router.put(
  "/:id/progression",
  authentifier,
  exigerRole("ETUDIANT"),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const etudiantId = (req as any).user.id;
      const { progression } = req.body;
      if (progression === undefined) {
        res.status(400).json({ erreur: "Progression obligatoire" });
        return;
      }
      const inscriptionExiste = await prisma.inscription.findFirst({
        where: {
          id,
          etudiantId,
        },
      });
      if (!inscriptionExiste) {
        res.status(404).json({ erreur: "Inscription introuvable" });
        return;
      }
      const inscription = await prisma.inscription.update({
        where: { id },
        data: {
          progression,
        },
      });
      res.json(inscription);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

export default router;
