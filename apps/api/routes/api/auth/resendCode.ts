import { Request, Response } from "express";
import { Api } from "telegram";
import { telegramClientLogin } from "../../../lib/telegram";

module.exports = {
  path: "/api/auth/resendcode",
  handler: async function handler(req: Request, res: Response) {
    const { phoneNumber, phoneCodeHash, stringSession } = req.body;

    const telegramClient = await telegramClientLogin(stringSession || "");

    try {
      await telegramClient.invoke(
        new Api.auth.ResendCode({
          phoneNumber: String(phoneNumber),
          phoneCodeHash: String(phoneCodeHash),
        })
      );

      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save() });
    } catch (err: any) {
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err: err });
    }
  },
};
