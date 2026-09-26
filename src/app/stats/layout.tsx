import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Estadísticas de estafas",
  description: "¿En qué estafas crypto cae más la gente al primer intento? Datos reales y anónimos de los simulacros de FYV Box.",
  path: "/stats",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
