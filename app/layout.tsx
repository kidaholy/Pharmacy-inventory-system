import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaSuite Cloud",
  description: "Pharmacy Management System",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
