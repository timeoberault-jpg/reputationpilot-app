import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReputationPilot",
  description: "Never miss a customer review again.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
