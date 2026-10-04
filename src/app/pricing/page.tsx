import MainLayout from "../../layouts/MainLayout";
import PricingPage from "../../components/pricing/PricingPage";

export const metadata = { title: "Pricing – Castpoint" };

export default function Page() {
  return (
    <MainLayout>
      <PricingPage />
    </MainLayout>
  );
}
