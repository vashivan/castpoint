import MainLayout from "../../../layouts/MainLayout";
import FindArtists from "../../../components/employer/FindArtists";

export const metadata = { title: "Find artists – Castpoint" };

export default function Page() {
  return (
    <MainLayout>
      <FindArtists />
    </MainLayout>
  );
}
