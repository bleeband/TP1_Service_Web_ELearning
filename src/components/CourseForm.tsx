"use client";

import { FormEvent, useState } from "react";

import api from "@/lib/api";

type Props = {
  onCreated: () => void;
};

export default function CourseForm({ onCreated }: Props) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [niveau, setNiveau] = useState("DEBUTANT");
  const [erreur, setErreur] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setErreur("");

      await api.post("/cours", {
        titre,
        description,
        niveau,
      });

      setTitre("");
      setDescription("");
      setNiveau("DEBUTANT");

      onCreated();
    } catch {
      setErreur("Impossible de creer le cours");
    }
  }

  return (
    <form className="formulaire" onSubmit={handleSubmit}>
      <h2>Creer un cours</h2>

      {erreur && <p className="erreur">{erreur}</p>}

      <label htmlFor="titre">Titre</label>

      <input
        id="titre"
        value={titre}
        onChange={(event) => setTitre(event.target.value)}
        required
      />

      <label htmlFor="description">Description</label>

      <textarea
        id="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />

      <label htmlFor="niveau">Niveau</label>

      <select
        id="niveau"
        value={niveau}
        onChange={(event) => setNiveau(event.target.value)}
      >
        <option value="DEBUTANT">Debutant</option>

        <option value="INTERMEDIAIRE">Intermediaire</option>

        <option value="AVANCE">Avance</option>
      </select>

      <button type="submit">Creer le cours</button>
    </form>
  );
}
