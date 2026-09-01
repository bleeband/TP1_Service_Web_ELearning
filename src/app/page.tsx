"use client";

import { useState } from "react";

import CourseForm from "@/components/CourseForm";
import CourseList from "@/components/CourseList";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { utilisateur } = useAuth();

  const [refresh, setRefresh] = useState(0);

  function rafraichirCours() {
    setRefresh((valeur) => valeur + 1);
  }

  return (
    <main>
      <h1>Academie en ligne</h1>

      <p>Decouvrez les cours disponibles.</p>

      {utilisateur?.role === "FORMATEUR" && (
        <CourseForm onCreated={rafraichirCours} />
      )}

      <CourseList refresh={refresh} />
    </main>
  );
}
