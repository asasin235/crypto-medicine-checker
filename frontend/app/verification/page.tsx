import { PageHero } from "@/components/layout/page-hero";

export default function VerificationPage() {
  return (
    <PageHero
      eyebrow="Security"
      title="Medicine verification"
      description="Scan QR codes to verify medicine authenticity — RSA-signed and blockchain-backed for tamper detection."
      stats={[
        { label: "Scans today", value: "—" },
        { label: "Verified", value: "—" },
        { label: "Flagged", value: "—" },
      ]}
    />
  );
}
