import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Entrar",
  description: "Entra a FYV Box con tu correo: te enviamos un código y tu progreso queda guardado en una billetera Stellar de testnet.",
  path: "/entrar",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
