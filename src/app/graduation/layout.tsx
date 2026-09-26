import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mis credenciales",
  description: "Credenciales verificables de FYV Box ligadas a tu dirección Stellar de prueba.",
  path: "/graduation",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
