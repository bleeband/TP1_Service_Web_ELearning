"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

type Cours = {
  id: number;
  titre: string;
  description: string;
  niveau: string;
  formateur: {
    nom: string;
  };
};

type Props = {
  refresh: number;
};

export default function CourseList({
  refresh,
}: Props) {
  const [cours, setCours] = useState<Cours[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    chargerCours();
  }, [refresh]);

  async function chargerCours() {
    try {
      setChargement(true);
      setErreur("");

      const reponse = await api.get("/cours");

      setCours(reponse.data.cours);
    } catch {
      setErreur("Impossible de charger les cours");
    } finally {
      setChargement(false);
    }
  }

  if (chargement) {
    return <p>Chargement des cours...</p>;
  }

  if (erreur) {
    return <p className="erreur">{erreur}</p>;
  }

  return (
    <section className="liste-cours">
      {cours.length === 0 ? (
        <p>Aucun cours disponible.</p>
      ) : (
        cours.map((cours) => (
          <article
            key={cours.id}
            className="carte-cours"
          >
            <h2>{cours.titre}</h2>

            <p>{cours.description}</p>

            <p>
              <strong>Niveau :</strong>{" "}
              {cours.niveau}
            </p>

            <p>
              <strong>Formateur :</strong>{" "}
              {cours.formateur.nom}
            </p>
          </article>
        ))
      )}
    </section>
  );
}
