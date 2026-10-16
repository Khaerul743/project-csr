import { Metadata } from "next";
import { BeneficiaryReviewView } from "@/components/public-review/BeneficiaryReviewView";

export const instant = false;

interface PageProps {
  params: Promise<{ programId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Survei & Penilaian Kepuasan Program CSR | Dampak Bersama",
    description:
      "Formulir survei dan ulasan kepuasan penerima manfaat dan masyarakat sekitar program CSR.",
  };
}

export default async function PublicReviewPage({ params }: PageProps) {
  const { programId } = await params;
  return <BeneficiaryReviewView programId={programId} />;
}
