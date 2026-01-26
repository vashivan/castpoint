// src/app/decision/page.tsx
import db from "@/lib/db";
import { Confirm } from "./Confirm";
import MainLayout from "@/layouts/MainLayout";

export default async function DecisionPage(props: {
  searchParams: Promise<{ token?: string; action?: string }>;
}) {
  const searchParams = await props.searchParams; // ✅ розгортаємо Promise
  const token = searchParams.token;
  const actionRaw = searchParams.action;

  if (!token || !actionRaw) {
    return <ErrorBlock text="Invalid decision link." />;
  }

  const action = actionRaw.toLowerCase();
  if (!["approved", "rejected"].includes(action)) {
    return <ErrorBlock text="Unknown action." />;
  }

  const [rows]: any = await db.execute(
    `SELECT application_title, status
       FROM applications
      WHERE status_token = ?
      LIMIT 1`,
    [token]
  );

  const app = rows?.[0];
  if (!app) return <ErrorBlock text="This link is expired or invalid." />;

  if (app.status !== "under review") {
    return (
      <InfoBlock
        title="Decision already made"
        text={`This application has already been ${app.status}.`}
      />
    );
  }

  return (
    <Confirm
      token={token}
      action={action as "approved" | "rejected"}
      title={app.application_title}
    />
  );
}

/* -------- same UI blocks as before -------- */

function ErrorBlock({ text }: { text: string }) {
  return (
    <Layout>
      <h1>Error</h1>
      <p>{text}</p>
    </Layout>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <Layout>
      <h1>{title}</h1>
      <p>{text}</p>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
     <MainLayout>
      <div className="min-h-[70vh] w-full flex items-center justify-center px-4">
        <div className="w-full max-w-130 flex flex-col items-center text-center gap-3">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
