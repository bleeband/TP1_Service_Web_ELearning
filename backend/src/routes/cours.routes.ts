import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRole } from "../middlewares/auth.middleware.js";
const router = Router();

// ---- COURS ----- //
//afficher tous les cours
router.get("/", async (req: Request, res: Response) => {
  try {
    const cours = await prisma.cours.findMany({
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
    });
    res.json(cours);
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});

//afficher un cours
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const cours = await prisma.cours.findUnique({
      where: { id },
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
    });
    if (!cours) {
      res.status(404).json({ erreur: "Cours introuvable" });
      return;
    }
    res.json(cours);
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});

//créer un cours
router.post(
  "/",
  authentifier,
  exigerRole("FORMATEUR"),
  async (req: Request, res: Response) => {
    try {
      const { titre, description, niveau } = req.body;
      const formateurId = (req as any).user.id;
      if (!titre || !description || !niveau) {
        res
          .status(400)
          .json({ erreur: "Titre, description et niveau obligatoires" });
        return;
      }
      const cours = await prisma.cours.create({
        data: {
          titre,
          description,
          niveau,
          formateurId,
        },
      });
      res.status(201).json(cours);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

//modifier un cours
router.put(
  "/:id",
  authentifier,
  exigerRole("FORMATEUR"),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { titre, description, niveau } = req.body;
      const coursExiste = await prisma.cours.findUnique({
        where: { id },
      });
      if (!coursExiste) {
        res.status(404).json({ erreur: "Cours introuvable" });
        return;
      }
      const cours = await prisma.cours.update({
        where: { id },
        data: {
          titre,
          description,
          niveau,
        },
      });
      res.json(cours);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

//supprimer un cours
router.delete(
  "/:id",
  authentifier,
  exigerRole("FORMATEUR"),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const coursExiste = await prisma.cours.findUnique({
        where: { id },
      });
      if (!coursExiste) {
        res.status(404).json({ erreur: "Cours introuvable" });
        return;
      }
      await prisma.cours.delete({
        where: { id },
      });
      res.json({ message: "Cours supprime" });
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

// ---- LESSON ----- //
//afficher les leçons d'un cours
router.get("/:id/lecons", async (req: Request, res: Response) => {
  try {
    const coursId = Number(req.params.id);
    const lecons = await prisma.lecon.findMany({
      where: { coursId },
      orderBy: {
        ordre: "asc",
      },
    });
    res.json(lecons);
  } catch {
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});
//créer une leçon dans un cours
router.post(
  "/:id/lecons",
  authentifier,
  exigerRole("FORMATEUR"),
  async (req: Request, res: Response) => {
    try {
      const coursId = Number(req.params.id);
      const { titre, contenu, ordre } = req.body;
      if (!titre || !contenu || ordre === undefined) {
        res
          .status(400)
          .json({ erreur: "Titre, contenu et ordre obligatoires" });
        return;
      }
      const coursExiste = await prisma.cours.findUnique({
        where: { id: coursId },
      });
      if (!coursExiste) {
        res.status(404).json({ erreur: "Cours introuvable" });
        return;
      }
      const lecon = await prisma.lecon.create({
        data: {
          titre,
          contenu,
          ordre,
          coursId,
        },
      });
      res.status(201).json(lecon);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);
//modifier une leçon
router.put(
  "/:id/lecons/:leconId",
  authentifier,
  exigerRole("FORMATEUR"),
  async (req: Request, res: Response) => {
    try {
      const leconId = Number(req.params.leconId);
      const { titre, contenu, ordre } = req.body;
      const leconExiste = await prisma.lecon.findUnique({
        where: { id: leconId },
      });
      if (!leconExiste) {
        res.status(404).json({ erreur: "Lecon introuvable" });
        return;
      }
      const lecon = await prisma.lecon.update({
        where: { id: leconId },
        data: {
          titre,
          contenu,
          ordre,
        },
      });
      res.json(lecon);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);
//supprimer une leçon
router.delete(
  "/:id/lecons/:leconId",
  authentifier,
  exigerRole("FORMATEUR"),
  async (req: Request, res: Response) => {
    try {
      const leconId = Number(req.params.leconId);
      const leconExiste = await prisma.lecon.findUnique({
        where: { id: leconId },
      });
      if (!leconExiste) {
        res.status(404).json({ erreur: "Lecon introuvable" });
        return;
      }
      await prisma.lecon.delete({
        where: { id: leconId },
      });
      res.json({ message: "Lecon supprimee" });
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

export default router;
