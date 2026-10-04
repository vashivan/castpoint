import MessagePage from "../ds/MessagePage";
import { Button } from "../ds/Button";

export default function RegistrationSuccessPage() {
  return (
    <MessagePage kicker="Registration successful" title={<>You&apos;re<br />in the<br />cast.</>} sticker="Welcome!">
      <p>Your artist profile is ready. Sign in to complete it and start applying to contracts.</p>
      <Button href="/login" arrow className="mt-8">Sign in</Button>
    </MessagePage>
  );
}
