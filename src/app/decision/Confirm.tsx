"use client";

import MainLayout from "@/layouts/MainLayout";
import { useState } from "react";

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

  return (
    <MainLayout>
      <div className="min-h-[70vh] w-full flex gap-2.5 flex-col items-center justify-center px-4">
      <h1>
        {action === "approved" ? "Approve application" : "Reject application"}
      </h1>

      <p style={{ marginTop: 12 }}>
        You are about to <b>{action}</b> the application for:
      </p>

      <div>
        <b>{title}</b>
      </div>

      <p>
        Once confirmed:
        <br />• the application status will be updated
        <br />• the artist will be notified automatically
      </p>

      <button
        onClick={confirm}
        disabled={loading}
        style={{
          marginTop: 24,
          padding: "12px 20px",
          borderRadius: 10,
          background: action === "approved" ? "#16a34a" : "#dc2626",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Processing..." : "Confirm decision"}
      </button>
      </div>
    </MainLayout>
  );
}
