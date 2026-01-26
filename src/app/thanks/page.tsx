import MainLayout from "@/layouts/MainLayout";

export default async function Thanks(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const status = searchParams.status

  return (
    <MainLayout>
      <div className="min-h-[70vh] w-full flex gap-2.5 flex-col items-center justify-center px-4">
        <h1>Decision confirmed.</h1>
        <p>
          Application has been <b>{status}</b>.
        </p>
      </div>
    </MainLayout>
  );
}
