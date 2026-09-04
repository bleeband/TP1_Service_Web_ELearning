"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { utilisateur, deconnexion } = useAuth();
  const pathname = usePathname();

  const getRoleClass = (role: string) => {
    switch (role) {
      case "ETUDIANT":
        return "etudiant";
      case "FORMATEUR":
        return "formateur";
      case "ADMIN":
        return "admin";
      default:
        return "";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <div className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 3 3 5 6 5s6-2 6-5v-5" />
          </svg>
        </div>
        <span>Académie</span>
      </Link>

      <div className="navbar-links">
        <Link 
          href="/" 
          className={`nav-link ${pathname === "/" ? "active" : ""}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Cours
        </Link>

        {utilisateur?.role === "ETUDIANT" && (
          <Link 
            href="/mes-cours" 
            className={`nav-link ${pathname === "/mes-cours" ? "active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
            Mes cours
          </Link>
        )}

        {utilisateur ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.5rem" }}>
            <div className="user-badge">
              <div className="user-avatar">{getInitials(utilisateur.nom)}</div>
              <span style={{ fontWeight: 600 }}>{utilisateur.nom}</span>
              <span className={`role-pill ${getRoleClass(utilisateur.role)}`}>
                {utilisateur.role}
              </span>
            </div>

            <button 
              onClick={deconnexion} 
              className="btn-ghost"
              title="Se déconnecter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Quitter
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginLeft: "0.5rem" }}>
            <Link href="/connexion" className="btn-secondary" style={{ padding: "0.45rem 0.95rem", fontSize: "0.875rem" }}>
              Connexion
            </Link>
            <Link href="/inscription" className="btn-primary" style={{ padding: "0.45rem 0.95rem", fontSize: "0.875rem" }}>
              Commencer
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
