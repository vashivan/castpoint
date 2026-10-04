import MainLayout from "../../../layouts/MainLayout";
import CompanyReviews from "../../../components/reviews/CompanyReviews";

export default async function Page({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  return (
    <MainLayout>
      <CompanyReviews name={decodeURIComponent(company)} />
    </MainLayout>
  );
}
