import { Request, Response } from "express";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import { asyncForEach } from "../../../lib/utils";

module.exports = {
  path: "/api/user/dialogs",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession } = req.body;

    if (!stringSession || req.method != "POST") {
      return res.status(400).json({
        err: "Request not valid",
      });
    }
    const telegramClient = await telegramClientLogin(stringSession || "");

    if (!(await isAuthorized(telegramClient))) {
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      const result = await telegramClient.getDialogs({
        limit: 75,
        ignorePinned: false,
      });
      if (result) {
        const chats: any[] = [
          {
            name: "Saved messages",
            id: "me",
          },
        ];

        await asyncForEach(result, async (chat, i) => {
          if (
            chat.entity &&
            !chat.isChannel &&
            !chat.isGroup &&
            Number(chat.entity.id) !=
              Number(((await telegramClient.getMe()) as any).id)
          ) {
            chats.push({
              name:
                ((chat.entity as any).firstName || "") +
                  " " +
                  ((chat.entity as any).lastName || "") ||
                "@" + (chat.entity as any).username,
              id: chat.entity.id,
            });
          }
        });

        return res
          .status(200)
          .json({ stringSession: telegramClient.session.save(), data: chats });
      } else {
        return res.status(400).json({
          err: "USER_NOT_FOUND",
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
