import { Metadata } from "next";
import { AuthLayout, RegisterForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Daftar Akun Baru — SIPENA",
  description:
    "Daftarkan akun institusi Anda di SIPENA untuk mulai berkolaborasi dalam inisiatif keberlanjutan dan CSR terverifikasi.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Mulai Kolaborasi Dampak"
      subtitle="Daftarkan akun untuk terhubung dengan berbagai inisiatif CSR dan mitra terverifikasi."
      footerText="Sudah memiliki akun?"
      footerActionText="Masuk ke Akun"
      footerActionHref="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
