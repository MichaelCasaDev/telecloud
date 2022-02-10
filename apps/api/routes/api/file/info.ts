import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";

module.exports = {
  path: "/api/file/info",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession, id } = req.body;

    if (!stringSession || !id || req.method != "POST") {
      return res.status(400).json({
        err: "Request not valid",
      });
    }

    const telegramClient = await telegramClientLogin(stringSession || "");
    const db = (await connectToDatabase()).db();
    let found = false;

    if (!(await isAuthorized(telegramClient))) {
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      const me = await telegramClient.getMe();
      const user: any = await db
        .collection("users")
        .findOne({ telegramId: String((me as any).id) });

      // Check if file is in user array
      user.files.forEach((e: any) => {
        if (e.uuid == id) found = true;
      });

      if (!found) {
        return res.status(404).json({
          stringSession: telegramClient.session.save(),
          err: "File not found!!",
        });
      }

      const result = await db
        .collection(config.database.collections.files)
        .findOne({
          uuid: String(id),
        });

      if (result) {
        return res
          .status(200)
          .json({ stringSession: telegramClient.session.save(), result });
      } else {
        return res.status(404).json({
          stringSession: telegramClient.session.save(),
          err: "File not found!!",
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
