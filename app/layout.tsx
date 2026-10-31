import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${inter.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9F9FB] text-[#1A1C1D] selection:bg-emerald-600 selection:text-white font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
