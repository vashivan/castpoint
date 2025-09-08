import MainLayout from '../../layouts/MainLayout';
import ResetPassword from '../../components/layout/ResetPassword';

// Вимикаємо SSG/кеш і змушуємо рендеритись динамічно,
// щоб білд не намагався пререндерити сторінку без токена
export const dynamic = 'force-dynamic';
// або: export const revalidate = 0;

export default function Page({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return (
    <MainLayout>
      <ResetPassword token={token} />
    </MainLayout>
  );
}
