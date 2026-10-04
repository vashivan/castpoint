import MessagePage from "../ds/MessagePage";
import { Button } from "../ds/Button";

export default function Blog() {
  return (
    <MessagePage kicker="Blog" title={<>Stories<br />from the<br />road.</>} sticker="Coming soon">
      <p>Life, work and lifehacks about living abroad on contract, written by artists. The first posts are on their way.</p>
      <Button href="/vacancies" arrow className="mt-8">Browse contracts</Button>
    </MessagePage>
  );
}
