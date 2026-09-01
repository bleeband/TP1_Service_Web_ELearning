"use client";

import CourseList from "@/components/CourseList";

export default function Home() {
  return (
    <main>
      <h1>Academie en ligne</h1>

      <p>
        Decouvrez les cours disponibles.
      </p>

      <CourseList refresh={0} />
    </main>
  );
}
