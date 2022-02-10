import { Request, Response } from "express";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";

module.exports = {
  path: "/api/extra/getmsgs",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession } = req.body;

    const telegramClient = await telegramClientLogin(stringSession || "");

    if (!(await isAuthorized(telegramClient))) {
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      const result = await telegramClient.getMessages("me", {
        limit: 100,
      });

      let msgs: any[] = [];

      result.forEach((e: any) => {
        msgs.push({
          text: e.text,
          id: e.id,
          hasMedia: e.media != null,
        });
      });

      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save(), result: msgs });
    } catch (err: any) {
      res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err: err });
    }
  },
};
