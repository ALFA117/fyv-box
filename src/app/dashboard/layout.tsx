import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mapa de misiones",
  description: "Tu progreso en los 6 módulos de FYV Box: elige una misión y practica cómo detectar estafas crypto.",
  path: "/dashboard",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
