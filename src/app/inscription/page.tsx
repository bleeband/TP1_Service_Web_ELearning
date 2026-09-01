"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

export default function InscriptionPage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setErreur("");

      await api.post("/auth/register", {
        nom,
        email,
        motDePasse,
      });

      router.push("/connexion");
    } catch {
      setErreur("Impossible de creer le compte");
    }
  }

  return (
    <main>
      <form
        className="formulaire"
        onSubmit={handleSubmit}
      >
        <h1>Inscription</h1>

        {erreur && (
          <p className="erreur">
            {erreur}
          </p>
        )}

        <label htmlFor="nom">
          Nom
        </label>

        <input
          id="nom"
          value={nom}
          onChange={(event) =>
            setNom(event.target.value)
          }
          required
        />

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
          Creer mon compte
        </button>
      </form>
    </main>
  );
}
