import { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export function authentifier(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ erreur: "Token manquant" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    (req as any).user = payload;

    next();
  } catch {
    return res.status(401).json({ erreur: "Token invalide / expire" });
  }
}

export function exigerRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.role !== role) {
      return res.status(403).json({ erreur: "Acces refuse" });
    }

    next();
  };
}