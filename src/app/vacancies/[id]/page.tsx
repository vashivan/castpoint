import MainLayout from "../../../layouts/MainLayout";
import ContractDetail from "../../../components/vacancies/ContractDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <MainLayout>
      <ContractDetail id={id} />
    </MainLayout>
  );
}
