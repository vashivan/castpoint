// src/app/api/telegram-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;

    from?: {
      id: number;
    };

    message?: {
      message_id: number;

      chat: {
        id: number;
      };

      text?: string;
    };
  };
};

async function telegramApi(
  method: string,
  body: Record<string, unknown>
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(body),
    }
  );

  const responseText = await res.text();

  if (!res.ok) {
    console.error(
      `[telegram.${method}.error]`,
      responseText
    );
  } else {
    console.log(
      `[telegram.${method}.success]`,
      responseText
    );
  }

  return res;
}

export async function POST(req: NextRequest) {
  try {
    console.log("[telegram.webhook] incoming");

    const webhookSecret =
      process.env.TELEGRAM_WEBHOOK_SECRET;

    if (webhookSecret) {
      const receivedSecret = req.headers.get(
        "x-telegram-bot-api-secret-token"
      );

      if (receivedSecret !== webhookSecret) {
        console.error(
          "[telegram.webhook] invalid secret"
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Invalid webhook secret",
          },
          {
            status: 401,
          }
        );
      }
    }

    const update: TelegramUpdate =
      await req.json();

    console.log(
      "[telegram.webhook.update]",
      JSON.stringify(update, null, 2)
    );

    const callback = update.callback_query;

    if (!callback?.data) {
      console.log(
        "[telegram.webhook] no callback data"
      );

      return NextResponse.json({
        ok: true,
      });
    }

    const adminChatId =
      process.env.TELEGRAM_CHAT_ID;

    const callbackChatId =
      callback.message?.chat.id;

    console.log(
      "[telegram.webhook.callback]",
      {
        data: callback.data,
        callbackChatId,
        adminChatId,
      }
    );

    if (
      adminChatId &&
      String(callbackChatId) !==
        String(adminChatId)
    ) {
      await telegramApi(
        "answerCallbackQuery",
        {
          callback_query_id:
            callback.id,

          text: "Not authorized",

          show_alert: true,
        }
      );

      return NextResponse.json({
        ok: true,
      });
    }

    const [
      entity,
      action,
      rawId,
    ] = callback.data.split(":");

    const id = Number(rawId);

    console.log(
      "[telegram.webhook.action]",
      {
        entity,
        action,
        id,
      }
    );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      await telegramApi(
        "answerCallbackQuery",
        {
          callback_query_id:
            callback.id,

          text: "Invalid ID",

          show_alert: true,
        }
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // EMPLOYER APPROVE

    if (
      entity === "employer" &&
      action === "approve"
    ) {
      const [result]: any =
        await db.execute(
          `
          UPDATE employers
          SET
            status = 'verified',
            updated_at = NOW()
          WHERE id = ?
          `,
          [id]
        );

      console.log(
        "[telegram.employer.approve]",
        result
      );

      if (
        result.affectedRows === 0
      ) {
        await telegramApi(
          "answerCallbackQuery",
          {
            callback_query_id:
              callback.id,

            text:
              "Employer not found",

            show_alert: true,
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      await telegramApi(
        "answerCallbackQuery",
        {
          callback_query_id:
            callback.id,

          text:
            "Employer approved ✅",
        }
      );

      await markMessageProcessed(
        callback,
        "✅ EMPLOYER APPROVED"
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // EMPLOYER BLOCK

    if (
      entity === "employer" &&
      action === "block"
    ) {
      const [result]: any =
        await db.execute(
          `
          UPDATE employers
          SET
            status = 'blocked',
            updated_at = NOW()
          WHERE id = ?
          `,
          [id]
        );

      console.log(
        "[telegram.employer.block]",
        result
      );

      await telegramApi(
        "answerCallbackQuery",
        {
          callback_query_id:
            callback.id,

          text:
            "Employer blocked 🚫",
        }
      );

      await markMessageProcessed(
        callback,
        "🚫 EMPLOYER BLOCKED"
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // JOB APPROVE

    if (
      entity === "job" &&
      action === "approve"
    ) {
      const [result]: any =
        await db.execute(
          `
          UPDATE jobs
          SET
            status = 'approved',
            is_active = 1,
            updated_at = NOW()
          WHERE id = ?
            AND status = 'pending'
          `,
          [id]
        );

      console.log(
        "[telegram.job.approve]",
        result
      );

      if (
        result.affectedRows === 0
      ) {
        await telegramApi(
          "answerCallbackQuery",
          {
            callback_query_id:
              callback.id,

            text:
              "Vacancy not found or already processed",

            show_alert: true,
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      await telegramApi(
        "answerCallbackQuery",
        {
          callback_query_id:
            callback.id,

          text:
            "Vacancy published ✅",
        }
      );

      await markMessageProcessed(
        callback,
        "✅ VACANCY PUBLISHED"
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // JOB REJECT

    if (
      entity === "job" &&
      action === "reject"
    ) {
      const [result]: any =
        await db.execute(
          `
          UPDATE jobs
          SET
            status = 'rejected',
            is_active = 0,
            updated_at = NOW()
          WHERE id = ?
          `,
          [id]
        );

      console.log(
        "[telegram.job.reject]",
        result
      );

      await telegramApi(
        "answerCallbackQuery",
        {
          callback_query_id:
            callback.id,

          text:
            "Vacancy rejected ❌",
        }
      );

      await markMessageProcessed(
        callback,
        "❌ VACANCY REJECTED"
      );

      return NextResponse.json({
        ok: true,
      });
    }

    console.log(
      "[telegram.webhook] unknown action",
      callback.data
    );

    await telegramApi(
      "answerCallbackQuery",
      {
        callback_query_id:
          callback.id,

        text: "Unknown action",

        show_alert: true,
      }
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[telegram.webhook.error]",
      error
    );

    return NextResponse.json({
      ok: false,
    });
  }
}

async function markMessageProcessed(
  callback: NonNullable<
    TelegramUpdate["callback_query"]
  >,
  statusText: string
) {
  const message = callback.message;

  if (!message) {
    console.log(
      "[telegram.message] message missing"
    );

    return;
  }

  const oldText =
    message.text || "";

  await telegramApi(
    "editMessageText",
    {
      chat_id:
        message.chat.id,

      message_id:
        message.message_id,

      text:
        `${oldText}\n\n${statusText}`,

      reply_markup: {
        inline_keyboard: [],
      },
    }
  );
}