import { Metadata } from "next";
import { RegisterView } from "@/components/auth";

export const metadata: Metadata = {
  title: "Daftar Akun Baru — SIPENA",
  description:
    "Daftarkan akun pribadi Anda di SIPENA untuk mengakses dashboard, lalu lengkapi identitas perusahaan atau yayasan untuk kolaborasi program CSR.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
