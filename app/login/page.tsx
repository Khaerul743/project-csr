import { Metadata } from "next";
import { LoginView } from "@/components/auth";

export const metadata: Metadata = {
  title: "Masuk ke Akun — SIPENA",
  description:
    "Masuk ke platform SIPENA untuk mengelola tata kelola inisiatif proyek CSR dan kemitraan strategis secara lebih terstruktur.",
};

export default function LoginPage() {
  return <LoginView />;
}
