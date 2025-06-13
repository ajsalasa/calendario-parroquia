// src/App.tsx
// ------------------------------------------------------
// Responsive, static calendar list UI for church courses
// ------------------------------------------------------
// 🔑 1. Importa el CSS que contiene las directivas de Tailwind (@tailwind).
// 🔑 2. Si el plugin PostCSS de Tailwind no está activo (=> las clases no existen),
//        cargamos dinámicamente el CSS compilado desde un CDN para que la UI
//        nunca quede sin estilos, por muy roto que esté tu build local.
// ------------------------------------------------------
import "./index.css"; // <-- Debe contener @tailwind base/components/utilities
import { useEffect, useState } from "react";

/**
 * Dominio de un curso
 */
interface Course {
  title: string;
  start: string; // ISO date string YYYY‑MM‑DD
  end: string;   // ISO date string YYYY‑MM‑DD
  requirements?: string;
  description?: string;
}

/**
 * Usa datos ficticios mientras no haya backend.
 */
const USE_DUMMY = true;

const DUMMY_COURSES: Course[] = [
  {
    title: "Introducción a la Biblia",
    start: "2025-07-06",
    end: "2025-07-06",
    requirements: "Ninguno",
    description: "Sesión de 2 horas sobre los libros del Antiguo y Nuevo Testamento."
  },
  {
    title: "Curso de Bautismo",
    start: "2025-07-20",
    end: "2025-07-21",
    requirements: "Asistir a la misa dominical anterior",
    description: "Preparación espiritual y logística para recibir el sacramento."
  },
  {
    title: "Retiro de Jóvenes",
    start: "2025-08-15",
    end: "2025-08-17",
    requirements: "Edad 15‑25 años, permiso paterno firmado",
    description: "Fin de semana de reflexión y actividades al aire libre."
  }
];

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 0️⃣ Garantiza que haya estilos, incluso si Tailwind no compila
  useEffect(() => {
    const probe = document.createElement("div");
    probe.className = "hidden"; // debería ser display:none si Tailwind funciona
    document.body.appendChild(probe);
    const hidden = window.getComputedStyle(probe).display === "none";
    probe.remove();

    if (!hidden) {
      // Tailwind no está procesado ⇒ carga fallback CDN
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
      document.head.appendChild(link);
      console.warn("Tailwind CDN fallback injected – revisa tu configuración PostCSS (tailwindcss v4 necesita @tailwindcss/postcss)");
    }
  }, []);

  // 1️⃣ Carga datos
  useEffect(() => {
    if (USE_DUMMY) {
      setCourses(DUMMY_COURSES);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/data/courses.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        if (!Array.isArray(json)) throw new Error("JSON mal formado");
        setCourses(json as Course[]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2️⃣ Render UI
  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <header className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-600">Calendario de Cursos</h1>
        <p className="text-gray-600">Próximos cursos y sus requisitos</p>
      </header>

      {loading && <p className="text-center text-gray-500">Cargando…</p>}
      {error && !loading && (
        <p className="text-center text-red-600">Error al cargar cursos: {error}</p>
      )}

      {!loading && !error && (
        <main className="max-w-3xl mx-auto">
          {courses.length === 0 ? (
            <p className="text-center text-gray-500">No hay cursos programados actualmente.</p>
          ) : (
            <ul className="space-y-4">
              {courses.map((c) => (
                <li
                  key={c.title + c.start}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between transition hover:shadow-md"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{c.title}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(c.start).toLocaleDateString()} — {new Date(c.end).toLocaleDateString()}
                    </p>
                    {c.requirements && (
                      <p className="mt-1 text-sm text-gray-700"><strong>Requisitos:</strong> {c.requirements}</p>
                    )}
                    {c.description && (
                      <p className="mt-2 text-sm text-gray-600">{c.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      )}
    </div>
  );
}
