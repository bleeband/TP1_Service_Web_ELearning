"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUTS = ["ACTIVE", "TERMINEE", "ABANDONNEE"] as const;
type Statut = (typeof STATUTS)[number];

type Inscription = {
  id: number;
  statut: Statut;
  progression: number;
  dateInscription: string;
  cours: {
    id: number;
    titre: string;
  };
  etudiant: {
    id: number;
    nom: string;
    email: string;
  };
};

function libelleStatut(statut: Statut) {
  switch (statut) {
    case "ACTIVE":
      return "Active";
    case "TERMINEE":
      return "Terminée";
    case "ABANDONNEE":
      return "Abandonnée";
  }
}

export default function MesEtudiantsPage() {
  const { utilisateur } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [miseAJourId, setMiseAJourId] = useState<number | null>(null);

  useEffect(() => {
    if (utilisateur?.role === "FORMATEUR") {
      chargerInscriptions();
    } else {
      setChargement(false);
    }
  }, [utilisateur]);

  async function chargerInscriptions() {
    try {
      setChargement(true);
      setErreur("");

      const reponse = await api.get("/inscriptions/formateur");
      setInscriptions(reponse.data || []);
    } catch {
      setErreur("Impossible de charger les étudiants de vos cours.");
    } finally {
      setChargement(false);
    }
  }

  async function modifierStatut(inscriptionId: number, statut: Statut) {
    try {
      setMiseAJourId(inscriptionId);
      setErreur("");

      await api.put(`/inscriptions/${inscriptionId}/statut`, { statut });

      setInscriptions((actuelles) =>
        actuelles.map((inscription) =>
          inscription.id === inscriptionId
            ? { ...inscription, statut }
            : inscription,
        ),
      );
    } catch {
      setErreur("Impossible de modifier le statut de l'étudiant.");
    } finally {
      setMiseAJourId(null);
    }
  }

  const inscriptionsParCours = useMemo(() => {
    return inscriptions.reduce<Record<string, Inscription[]>>(
      (groupes, inscription) => {
        const cle = String(inscription.cours.id);
        groupes[cle] ??= [];
        groupes[cle].push(inscription);
        return groupes;
      },
      {},
    );
  }, [inscriptions]);

  if (!utilisateur) {
    return (
      <main style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <div className="form-card" style={{ maxWidth: "440px" }}>
          <h2>Connexion requise</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Connectez-vous avec un compte formateur pour gérer vos étudiants.
          </p>
          <Link href="/connexion" className="btn-primary" style={{ width: "100%" }}>
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  if (utilisateur.role !== "FORMATEUR") {
    return (
      <main style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <div className="form-card" style={{ maxWidth: "460px" }}>
          <h2>Espace réservé aux formateurs</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Seul le formateur d'un cours peut voir et gérer ses étudiants.
          </p>
          <Link href="/" className="btn-secondary" style={{ width: "100%" }}>
            Retour aux cours
          </Link>
        </div>
      </main>
    );
  }

  if (chargement) {
    return (
      <main style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <p style={{ color: "var(--color-text-muted)" }}>
          Chargement de vos étudiants...
        </p>
      </main>
    );
  }

  return (
    <main>
      <section className="animate-fade-in" style={{ marginBottom: "2rem" }}>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#c084fc",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Espace formateur
        </span>
        <h1 style={{ margin: "0.25rem 0 0.5rem", fontSize: "2.2rem", fontWeight: 800 }}>
          Mes étudiants
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Consultez les inscriptions de vos cours et gérez leur statut.
        </p>
      </section>

      {erreur && <div className="banner-error" style={{ marginBottom: "1.5rem" }}>{erreur}</div>}

      {inscriptions.length === 0 ? (
        <div className="form-card" style={{ textAlign: "center" }}>
          <h2>Aucun étudiant inscrit</h2>
          <p style={{ color: "var(--color-text-muted)" }}>
            Les inscriptions à vos cours apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {Object.values(inscriptionsParCours).map((groupe) => (
            <section key={groupe[0].cours.id} className="form-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0 }}>{groupe[0].cours.titre}</h2>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  {groupe.length} étudiant{groupe.length > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {groupe.map((inscription) => (
                  <article
                    key={inscription.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                    }}
                  >
                    <div>
                      <strong>{inscription.etudiant.nom}</strong>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {inscription.etudiant.email}
                      </div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                        Progression : {inscription.progression} %
                      </div>
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <span>Statut</span>
                      <select
                        value={inscription.statut}
                        disabled={miseAJourId === inscription.id}
                        onChange={(event) => modifierStatut(inscription.id, event.target.value as Statut)}
                        aria-label={`Statut de ${inscription.etudiant.nom}`}
                        style={{ padding: "0.55rem 0.7rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "inherit" }}
                      >
                        {STATUTS.map((statut) => (
                          <option key={statut} value={statut}>
                            {libelleStatut(statut)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
