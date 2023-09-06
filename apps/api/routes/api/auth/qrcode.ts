import { Request, Response } from "express";
import { telegramClientLogin } from "../../../lib/telegram";
import * as config from "../../../config";
import { Api } from "telegram";

module.exports = {
  path: "/api/auth/qrcode",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession } = req.body;
    const telegramClient = await telegramClientLogin(
      String(stringSession) || ""
    );

    // Generate qrcode
    try {
      const result: any = await telegramClient.invoke(
        new Api.auth.ExportLoginToken({
          apiId: config.telegram.apiId,
          apiHash: config.telegram.apiHash,
          exceptIds: [],
        })
      );

      await telegramClient.disconnect()
      return res.status(200).json({
        stringSession: telegramClient.session.save(),
        code:
          "tg://login?token=" + Buffer.from(result.token).toString("base64"),
        expires: result.expires,
      });
    } catch (err) {
      await telegramClient.disconnect()
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
