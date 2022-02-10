import { Request, Response } from "express";
import { Api } from "telegram";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";

module.exports = {
  path: "/api/auth/logout",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession } = req.body;

    try {
      const telegramClient = await telegramClientLogin(
        String(stringSession) || ""
      );

      if (!(await isAuthorized(telegramClient))) {
        return res.status(401).json({
          err: {
            errorMessage: "NOT_AUTHORIZED",
          },
        });
      }

      await telegramClient.invoke(new Api.auth.LogOut());
      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save() });
    } catch (err) {
      return res.status(500).json({ stringSession: stringSession, err });
    }
  },
};
