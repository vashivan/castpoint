// app/reset-password/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ResetForm from "../../components/layout/ResetPassword"

type SP = Record<string, string | string[] | undefined>;

function getVal(sp: SP, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v ?? '';
}

export default async function ResetPasswordPage(props: {
  searchParams?: Promise<SP> | SP;
}) {
  function isPromise(obj: unknown): obj is Promise<SP> {
    return !!obj && typeof (obj as Promise<SP>).then === 'function';
  }

  const sp = (props.searchParams && isPromise(props.searchParams))
    ? await props.searchParams
    : ((props.searchParams as SP) ?? {});

  const token = getVal(sp, 'token');
  const email = getVal(sp, 'email');

  return <ResetForm token={token} email={email} />;
}
