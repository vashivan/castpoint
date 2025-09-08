import MainLayout from '../../layouts/MainLayout';
import ResetPassword from '../../components/layout/ResetPassword';

export const dynamic = 'force-dynamic'; // щоб не пререндерити без токена
// або: export const revalidate = 0;

type SP = { token?: string };

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp = await searchParams; // <-- важливо
  const token = typeof sp?.token === 'string' ? sp.token : '';

  return (
    <MainLayout>
      <ResetPassword token={token} />
    </MainLayout>
  );
}
