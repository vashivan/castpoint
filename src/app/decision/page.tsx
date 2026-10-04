// src/app/decision/page.tsx
import db from "@/lib/db";
import { Confirm } from "./Confirm";
import MainLayout from "@/layouts/MainLayout";
import MessagePage from "@/components/ds/MessagePage";

import type { RowDataPacket } from "mysql2";
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

  const [rows] = await db.execute<RowDataPacket[]>(
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

/* -------- status blocks -------- */

function ErrorBlock({ text }: { text: string }) {
  return (
    <MainLayout>
      <MessagePage kicker="Decision link" title={<>Link<br />not valid.</>}>
        <p>{text}</p>
      </MessagePage>
    </MainLayout>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <MainLayout>
      <MessagePage kicker="Decision link" title={title}>
        <p>{text}</p>
      </MessagePage>
    </MainLayout>
  );
}
