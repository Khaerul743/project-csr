import { Metadata } from "next";
import { RegisterView } from "@/components/auth";

export const metadata: Metadata = {
  title: "Daftar Akun Baru — SIPENA",
  description:
    "Daftarkan akun institusi Anda di SIPENA untuk mulai mengelola program CSR dan membangun kolaborasi bersama mitra.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
