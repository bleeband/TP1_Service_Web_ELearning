import { Router, type Request, type Response } from "express";
import axios from "axios";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRole } from "../middlewares/auth.middleware.js";
const router = Router();

//generer un quiz
router.post(
  "/generer",
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
      const cours = await prisma.cours.findUnique({
        where: { id: coursId },
      });
      if (!cours) {
        res.status(404).json({ erreur: "Cours introuvable" });
        return;
      }
      const inscriptions = await prisma.inscription.findMany({
        where: {
          etudiantId,
          coursId,
        },
      });
      if (inscriptions.length === 0) {
        res.status(403).json({ erreur: "Vous devez etre inscrit a ce cours" });
        return;
      }
      const reponseApi = await axios.get(
        `${process.env.TRIVIA_API}?amount=5&type=multiple`,
      );
      const quiz = await prisma.quiz.create({
        data: {
          coursId,
          etudiantId,
        },
      });
      for (const questionApi of reponseApi.data.results) {
        await prisma.question.create({
          data: {
            enonce: questionApi.question,
            bonneReponse: questionApi.correct_answer,
            mauvaisesReponses: questionApi.incorrect_answers,
            quizId: quiz.id,
          },
        });
      }
      const questions = await prisma.question.findMany({
        where: { quizId: quiz.id },
      });
      res.status(201).json({
        quiz,
        questions,
      });
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

//voir mes quiz
router.get(
  "/",
  authentifier,
  exigerRole("ETUDIANT"),
  async (req: Request, res: Response) => {
    try {
      const etudiantId = (req as any).user.id;
      const quiz = await prisma.quiz.findMany({
        where: { etudiantId },
      });
      res.json(quiz);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

//modifier le score
router.put(
  "/:id/score",
  authentifier,
  exigerRole("ETUDIANT"),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const etudiantId = (req as any).user.id;
      const { score } = req.body;
      if (score === undefined) {
        res.status(400).json({ erreur: "Score obligatoire" });
        return;
      }
      const quiz = await prisma.quiz.findUnique({
        where: { id },
      });
      if (!quiz) {
        res.status(404).json({ erreur: "Quiz introuvable" });
        return;
      }
      if (quiz.etudiantId !== etudiantId) {
        res.status(403).json({ erreur: "Acces refuse" });
        return;
      }
      const quizModifie = await prisma.quiz.update({
        where: { id },
        data: {
          score,
        },
      });
      res.json(quizModifie);
    } catch {
      res.status(500).json({ erreur: "Erreur serveur" });
    }
  },
);

export default router;
