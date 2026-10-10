import { Metadata } from "next";
import { AuthLayout, LoginForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Masuk ke Akun - CSR Impact Hub",
  description:
    "Masuk ke platform CSR Impact Hub untuk mengelola inisiatif proyek CSR dan kemitraan strategis.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Masuk ke akun Anda untuk mengelola proyek CSR dan kolaborasi kemitraan."
      footerText="Belum memiliki akun?"
      footerActionText="Daftar Sekarang"
      footerActionHref="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}
