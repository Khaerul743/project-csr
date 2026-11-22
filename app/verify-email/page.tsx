import { Metadata } from "next";
import { VerifyEmailView } from "@/components/auth";

export const metadata: Metadata = {
  title: "Verifikasi Email - SIPENA",
  description:
    "Masukkan kode OTP 6 digit untuk memverifikasi alamat email Anda dan mengaktifkan akun SIPENA.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}

