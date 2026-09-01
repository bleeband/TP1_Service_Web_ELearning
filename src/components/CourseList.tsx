"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  const { utilisateur } = useAuth();

  const [cours, setCours] = useState<Cours[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

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

  async function inscrire(coursId: number) {
    try {
      setMessage("");

      await api.post("/inscriptions", {
        coursId,
      });

      setMessage("Inscription reussie");
    } catch {
      setMessage(
        "Impossible de vous inscrire. Vous etes peut-etre deja inscrit.",
      );
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
      {message && (
        <p className="message">
          {message}
        </p>
      )}

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

            {utilisateur?.role === "ETUDIANT" && (
              <button
                onClick={() => inscrire(cours.id)}
              >
                M'inscrire
              </button>
            )}
          </article>
        ))
      )}
    </section>
  );
}
