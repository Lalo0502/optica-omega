import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación | Óptica Omega",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.jpg",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-full">{children}</div>;
}
