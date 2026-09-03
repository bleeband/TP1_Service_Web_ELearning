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
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900">Academie en ligne</h1>

      <p className="text-gray-700 text-lg ">Decouvrez les cours disponibles.</p>

      {utilisateur?.role === "FORMATEUR" && (
        <CourseForm onCreated={rafraichirCours} />
      )}

      <CourseList refresh={refresh} />
    </main>
  );
}
