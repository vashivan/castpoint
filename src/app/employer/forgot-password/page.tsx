import MainLayout from "@/layouts/MainLayout";
import ForgotPassword from "@/components/layout/ForgotPassword";

export default function Page() {
  return (
    <MainLayout>
      <ForgotPassword type="employer" />
    </MainLayout>
  );
}
