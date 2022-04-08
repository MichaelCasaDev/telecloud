import { Request, Response } from "express";
import { telegramClientLogin } from "../../../lib/telegram";
import { Api } from "telegram";
import { generateRandomBytes } from "telegram/Helpers";
import { computeCheck } from "telegram/Password";
import * as config from "../../../config";
import { connectToDatabase, createUserDatabase } from "../../../lib/database";

module.exports = {
  path: "/api/auth/qrcodesignin",
  handler: async function handler(req: Request, res: Response) {
    const { password, token, stringSession } = req.body;
    const telegramClient = await telegramClientLogin(
      String(stringSession) || ""
    );
    const db = (await connectToDatabase()).db();

    try {
      if (password != "") {
        // Auth with 2FA password
        const passwordData: any = await telegramClient.invoke(
          new Api.account.GetPassword()
        );

        passwordData.newAlgo["salt1"] = Buffer.concat([
          passwordData.newAlgo["salt1"],
          generateRandomBytes(32),
        ]);

        await telegramClient.invoke(
          new Api.auth.CheckPassword({
            password: await computeCheck(passwordData, password),
          })
        );
      }

      // Check authentication for qrcode
      const result = await telegramClient.invoke(
        new Api.auth.ExportLoginToken({
          apiId: config.telegram.apiId,
          apiHash: config.telegram.apiHash,
          exceptIds: [],
        })
      );

      // Handle DC migration
      if (result instanceof Api.auth.LoginTokenMigrateTo) {
        const result1 = await telegramClient.invoke(
          new Api.auth.ImportLoginToken({
            token: Buffer.from(token || ""),
          })
        );

        // Return error if another migration error
        if (!(result1 instanceof Api.auth.LoginTokenSuccess)) {
          return res.status(500).json({
            stringSession: telegramClient.session.save(),
            err: {
              errorMessage: "Error while switching DC!!",
            },
          });
        }
      } else if (result instanceof Api.auth.LoginTokenSuccess) {
        // Logged in succesfully
        await createUserDatabase(db, telegramClient);

        return res
          .status(200)
          .json({ stringSession: telegramClient.session.save() });
      } else {
        return res.status(500).json({
          err: {
            errorMessage: "No auth",
          },
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
