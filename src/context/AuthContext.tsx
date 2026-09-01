"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "@/lib/api";

type Utilisateur = {
  id: number;
  email: string;
  nom: string;
  role: "ETUDIANT" | "FORMATEUR" | "ADMIN";
};

type AuthContextType = {
  utilisateur: Utilisateur | null;
  connexion: (email: string, motDePasse: string) => Promise<void>;
  deconnexion: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem("utilisateur");

    if (utilisateurSauvegarde) {
      setUtilisateur(JSON.parse(utilisateurSauvegarde));
    }
  }, []);

  async function connexion(email: string, motDePasse: string) {
    const reponse = await api.post("/auth/login", {
      email,
      motDePasse,
    });

    localStorage.setItem("token", reponse.data.token);

    localStorage.setItem(
      "utilisateur",
      JSON.stringify(reponse.data.utilisateur),
    );

    setUtilisateur(reponse.data.utilisateur);
  }

  function deconnexion() {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");

    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        connexion,
        deconnexion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit etre utilise dans AuthProvider");
  }

  return context;
}
