import { Request, Response } from "express";
import { Api } from "telegram";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import { createUserDatabase } from "../../../lib/database";

module.exports = {
  path: "/api/auth/login",
  handler: async function handler(req: Request, res: Response) {
    const { phoneNumber, phoneCode, phoneCodeHash, password, stringSession } =
      req.body;

    const telegramClient = await telegramClientLogin(stringSession || "");
    const db = (await connectToDatabase()).db();

    // User already authorized
    if (await isAuthorized(telegramClient)) {
      await createUserDatabase(db, telegramClient);

      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save() });
    }

    // Auth with PHONECODE
    if (!password) {
      try {
        await telegramClient.invoke(
          new Api.auth.SignIn({
            phoneNumber: String(phoneNumber),
            phoneCodeHash: String(phoneCodeHash),
            phoneCode: String(phoneCode),
          })
        );
      } catch (err) {
        return res
          .status(500)
          .json({ stringSession: telegramClient.session.save(), err });
      }

      await createUserDatabase(db, telegramClient);

      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save() });
    }

    // Auth with 2FA
    try {
      await telegramClient.invoke(
        new Api.auth.SignIn({
          phoneNumber: String(phoneNumber),
          phoneCodeHash: String(phoneCodeHash),
          phoneCode: String(phoneCode),
        })
      );
    } catch (err) {}

    try {
      await telegramClient.signInWithPassword(
        {
          apiHash: config.telegram.apiHash,
          apiId: config.telegram.apiId,
        },
        {
          password: async () => {
            return String(password);
          },
          onError: (err) => {
            res
              .status(500)
              .json({ stringSession: telegramClient.session.save(), err });
          },
        }
      );

      await createUserDatabase(db, telegramClient);

      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save() });
    } catch (err) {
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
