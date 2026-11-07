import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Estadísticas de estafas",
  description: "¿En qué estafas crypto cae más la gente al primer intento? Estadísticas anónimas de los simulacros de FYV Box (en pausa mientras su base de datos no está disponible).",
  path: "/stats",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
