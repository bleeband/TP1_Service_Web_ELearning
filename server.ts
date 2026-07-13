import express, { Request, Response } from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import coursRoutes from "./routes/cours.routes.js";
import inscriptionsRoutes from "./routes/inscriptions.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import utilisateursRoutes from "./routes/utilisateurs.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API Academie en ligne fonctionne" });
});

app.use("/auth", authRoutes);
app.use("/cours", coursRoutes);
app.use("/inscriptions", inscriptionsRoutes);
app.use("/quiz", quizRoutes);
app.use("/utilisateurs", utilisateursRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});