"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import QuizCourse from "@/components/QuizCourse";

type Inscription = {
  id: number;
  statut: string;
  progression: number;
  cours: {
    id: number;
    titre: string;
    description: string;
    niveau: string;
  };
};

export default function MesCoursPage() {
  const { utilisateur } = useAuth();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (utilisateur?.role === "ETUDIANT") {
      chargerInscriptions();
    } else {
      setChargement(false);
    }
  }, [utilisateur]);

  async function chargerInscriptions() {
    try {
      setChargement(true);
      setErreur("");

      const reponse = await api.get("/inscriptions");

      setInscriptions(reponse.data);
    } catch {
      setErreur("Impossible de charger vos inscriptions");
    } finally {
      setChargement(false);
    }
  }

  async function modifierProgression(
    inscriptionId: number,
    progression: number,
  ) {
    try {
      await api.put(`/inscriptions/${inscriptionId}/progression`, {
        progression,
      });

      await chargerInscriptions();
    } catch {
      setErreur("Impossible de modifier la progression");
    }
  }

  if (!utilisateur) {
    return (
      <main>
        <h1>Mes cours</h1>
        <p>Vous devez etre connecte.</p>
      </main>
    );
  }

  if (utilisateur.role !== "ETUDIANT") {
    return (
      <main>
        <h1>Mes cours</h1>
        <p>Cette page est reservee aux etudiants.</p>
      </main>
    );
  }

  if (chargement) {
    return (
      <main>
        <p>Chargement de vos cours...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Mes cours</h1>

      {erreur && <p className="erreur">{erreur}</p>}

      {inscriptions.length === 0 ?
        <p>Vous n'etes inscrit a aucun cours.</p>
      : <section className="liste-cours">
          {inscriptions.map((inscription) => (
            <article key={inscription.id} className="carte-cours">
              <h2>{inscription.cours.titre}</h2>

              <p>{inscription.cours.description}</p>

              <p>
                <strong>Statut :</strong> {inscription.statut}
              </p>

              <p>
                <strong>Progression :</strong> {inscription.progression} %
              </p>

              <div className="progression-boutons">
                <button onClick={() => modifierProgression(inscription.id, 25)}>
                  25 %
                </button>

                <button onClick={() => modifierProgression(inscription.id, 50)}>
                  50 %
                </button>

                <button onClick={() => modifierProgression(inscription.id, 75)}>
                  75 %
                </button>

                <button
                  onClick={() => modifierProgression(inscription.id, 100)}
                >
                  100 %
                </button>
              </div>
              <QuizCourse coursId={inscription.cours.id} />
            </article>
          ))}
        </section>
      }
    </main>
  );
}
