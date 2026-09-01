"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { utilisateur, deconnexion } = useAuth();

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        Academie
      </Link>

      <div className="navbar-liens">
        <Link href="/">
          Cours
        </Link>

        {utilisateur?.role === "ETUDIANT" && (
          <Link href="/mes-cours">
            Mes cours
          </Link>
        )}

        {utilisateur ? (
          <>
            <span>
              {utilisateur.nom} ({utilisateur.role})
            </span>

            <button onClick={deconnexion}>
              Deconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/connexion">
              Connexion
            </Link>

            <Link href="/inscription">
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
