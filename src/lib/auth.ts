import jwt from "jsonwebtoken";

export type UtilisateurToken = {
  id: number;
  email: string;
  role: "ETUDIANT" | "FORMATEUR" | "ADMIN";
};

export function creerToken(utilisateur: UtilisateurToken) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET manquant");
  }

  return jwt.sign(utilisateur, secret, {
    expiresIn: "2h",
  });
}

export function obtenirUtilisateur(request: Request): UtilisateurToken | null {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET manquant");
  }

  try {
    return jwt.verify(token, secret) as UtilisateurToken;
  } catch {
    return null;
  }
}
