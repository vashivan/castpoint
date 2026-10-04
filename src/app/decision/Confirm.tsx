"use client";

import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import MessagePage from "@/components/ds/MessagePage";
import { Button } from "@/components/ds/Button";

export function Confirm({
  token,
  action,
  title,
}: {
  token: string;
  action: "approved" | "rejected";
  title: string;
}) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    await fetch("/api/decision/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    window.location.href = `/thanks?status=${action}`;
  }

  const approve = action === "approved";

  return (
    <MainLayout>
      <MessagePage kicker="Confirm decision" title={approve ? <>Approve<br />application?</> : <>Reject<br />application?</>}>
        <p>
          You are about to <b>{action === "approved" ? "approve" : "reject"}</b> the application for:
        </p>
        <p className="font-display mt-4 text-[28px]">{title}</p>
        <ul className="mt-6 space-y-1 text-[16px]">
          <li>• the application status will be updated</li>
          <li>• the artist will be notified automatically</li>
        </ul>
        <Button onClick={confirm} disabled={loading} variant={approve ? "ink" : "primary"} arrow={!loading} className={`mt-8 ${approve ? "" : "bg-pink text-ink"}`}>
          {loading ? "Processing…" : approve ? "Confirm approval" : "Confirm rejection"}
        </Button>
      </MessagePage>
    </MainLayout>
  );
}
