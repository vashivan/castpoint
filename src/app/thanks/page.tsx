import MainLayout from "@/layouts/MainLayout";
import MessagePage from "@/components/ds/MessagePage";

export default async function Thanks(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;

  return (
    <MainLayout>
      <MessagePage kicker="Decision confirmed" title={<>Thank<br />you.</>}>
        <p>
          The application has been <b>{status ?? "updated"}</b>. The artist will get an e-mail about it.
        </p>
      </MessagePage>
    </MainLayout>
  );
}
