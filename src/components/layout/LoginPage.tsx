'use client'

import AuthShell from "../auth/AuthShell";
import ArtistLoginForm from "../auth/ArtistLoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      tone="lime"
      kicker="Welcome back"
      title={<>Back on<br />stage.</>}
      aside="Your profile, applications and reviews are waiting. Sign in to apply to new contracts in one tap."
    >
      <ArtistLoginForm />
    </AuthShell>
  );
}
