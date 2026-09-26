import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Verificar credencial",
  description: "Comprueba si una dirección Stellar completó el entrenamiento anti-estafas de FYV Box. Endpoint público para wallets y dApps.",
  path: "/verify",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
