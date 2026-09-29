import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "OG — They Call Him OG",
  description: "Enter the world of OG. A cinematic journey through the return of Ojas Gambheera.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
