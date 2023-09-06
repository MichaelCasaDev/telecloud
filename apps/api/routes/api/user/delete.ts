import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import { asyncForEach } from "../../../lib/utils";
import { Api } from "telegram";
import { stripeClientLogin } from "../../../lib/stripe";
import { FileInterface, UserInterface } from "../../../lib/types";

module.exports = {
  path: "/api/user/delete",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession } = req.body;
    if (!stringSession || req.method != "POST") {
      return res.status(400).json({
        err: "Request not valid",
      });
    }
    const telegramClient = await telegramClientLogin(stringSession || "");
    const db = (await connectToDatabase()).db();
    const stripeClient = stripeClientLogin();

    if (!(await isAuthorized(telegramClient))) {
      await telegramClient.disconnect()
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      const me = await telegramClient.getMe();
      const result = await db
        .collection(config.database.collections.users)
        .findOne({ telegramId: String((me as any).id) }) as any as UserInterface;

      if (result) {
        // Delete from users
        await db
          .collection(config.database.collections.users)
          .deleteOne({ telegramId: String((me as any).id) });

        // Delete from files
        await asyncForEach(result.files, async (e: FileInterface, i: number) => {
          await db
            .collection(config.database.collections.files)
            .deleteOne({ uuid: String(e.uuid) });
        });

        // Logout from telegram
        await telegramClient.invoke(new Api.auth.LogOut());

        // Delete customer from Stripe
        await stripeClient.customers.del(result.subscription.stripeId);

        await telegramClient.disconnect()
        return res.status(200).json({
          data: "ALL data deleted!",
        });
      } else {
        await telegramClient.disconnect()
        return res.status(400).json({
          err: "USER_NOT_FOUND",
        });
      }
    } catch (err) {
      await telegramClient.disconnect()
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
