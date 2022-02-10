import { Request, Response } from "express";
import { telegramClientLogin } from "../../../lib/telegram";
import * as config from "../../../config";
import { Api } from "telegram";

module.exports = {
  path: "/api/auth/sendcode",
  handler: async function handler(req: Request, res: Response) {
    const { phoneNumber, stringSession } = req.body;

    const telegramClient = await telegramClientLogin(stringSession || "");

    try {
      const result = await telegramClient.invoke(
        new Api.auth.SendCode({
          phoneNumber: String(phoneNumber),
          apiId: config.telegram.apiId,
          apiHash: config.telegram.apiHash,
          settings: new Api.CodeSettings({}),
        })
      );

      res.status(200).json({
        stringSession: telegramClient.session.save(),
        phoneCodeHash: result.phoneCodeHash,
        timeout: result.timeout || 0,
      });
    } catch (err) {
      res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err: err });
    }
  },
};
