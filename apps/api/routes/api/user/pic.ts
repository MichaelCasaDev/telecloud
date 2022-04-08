import { Request, Response } from "express";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";

module.exports = {
  path: "/api/user/pic",
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
      const result = await telegramClient.getMe();
      const buff = await telegramClient.downloadProfilePhoto(result);

      if (result && buff) {
        const base64 = buff.toString("base64");

        return res
          .status(200)
          .json({ stringSession: telegramClient.session.save(), data: base64 });
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
