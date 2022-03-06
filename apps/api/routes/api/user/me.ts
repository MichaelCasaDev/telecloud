import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";

module.exports = {
  path: "/api/user/me",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession } = req.body;

    if (!stringSession || req.method != "POST") {
      return res.status(400).json({
        err: "Request not valid",
      });
    }
    const telegramClient = await telegramClientLogin(stringSession || "");
    const db = (await connectToDatabase()).db();

    if (!(await isAuthorized(telegramClient))) {
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      const me = await telegramClient.getMe();
      const result: any = await db
        .collection(config.database.collections.users)
        .findOne({ telegramId: String((me as any).id) });

      if (result) {
        const nowDateNumber: Number = new Date(Date.now()).getTime();

        await db.collection(config.database.collections.users).updateOne(
          {
            telegramId: String((me as any).id),
          },
          {
            $set: {
              lastJoinAt: String(nowDateNumber),
            }
          }
        );

        return res
          .status(200)
          .json({ stringSession: telegramClient.session.save(), data: result });
      } else {
        return res.status(400).json({
          stringSession: telegramClient.session.save(),
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
