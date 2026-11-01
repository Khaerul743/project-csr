import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPENA — Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR",
  description:
    "Mencatat Aksi, Mengukur Dampak. Platform tata kelola CSR modern dan akuntabel yang menghubungkan perusahaan, yayasan/NGO, dan masyarakat secara transparan.",
  icons: {
    icon: "/LOGO SIPENA.png",
    shortcut: "/LOGO SIPENA.png",
    apple: "/LOGO SIPENA.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9F9FB] text-[#1A1C1D] selection:bg-emerald-600 selection:text-white font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
