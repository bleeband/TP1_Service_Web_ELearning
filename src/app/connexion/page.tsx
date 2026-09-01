"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function ConnexionPage() {
  const router = useRouter();

  const { connexion } = useAuth();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setErreur("");

      await connexion(email, motDePasse);

      router.push("/");
    } catch {
      setErreur("Email ou mot de passe invalide");
    }
  }

  return (
    <main>
      <form
        className="formulaire"
        onSubmit={handleSubmit}
      >
        <h1>Connexion</h1>

        {erreur && (
          <p className="erreur">
            {erreur}
          </p>
        )}

        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />

        <label htmlFor="motDePasse">
          Mot de passe
        </label>

        <input
          id="motDePasse"
          type="password"
          value={motDePasse}
          onChange={(event) =>
            setMotDePasse(event.target.value)
          }
          required
        />

        <button type="submit">
          Se connecter
        </button>
      </form>
    </main>
  );
}
