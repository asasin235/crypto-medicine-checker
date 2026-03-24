import { PageHero } from "@/components/layout/page-hero";

export default function LoginPage() {
  return (
    <PageHero
      eyebrow="Auth"
      title="Login placeholder"
      description="This route is prepared for JWT authentication flows, role-aware redirects, and secure token storage."
      stats={[
        { label: "JWT helpers", value: "Ready" },
        { label: "API client", value: "Configured" },
        { label: "UI shell", value: "Responsive" },
      ]}
    />
  );
}
