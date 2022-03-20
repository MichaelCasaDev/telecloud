import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import { asyncForEach } from "../../../lib/utils";
import * as config from "../../../config";
import { FileExpInterface, FileInterface, UserInterface } from "../../../lib/types";

module.exports = {
  path: "/api/user/files",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession, path } = req.body;
    if (!stringSession || !path || req.method != "POST") {
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
      const user = await db
        .collection(config.database.collections.users)
        .findOne({ telegramId: String((me as any).id) }) as any as UserInterface;

      let allFiles: FileExpInterface[] = [];
      let exist: boolean = path == "/" ? true : false;

      await asyncForEach(user.files, async (e: FileInterface, i: number) => {
        const file = await db
          .collection("files")
          .findOne({ uuid: String(e.uuid) }) as any as FileExpInterface;

        if (file && e.path == path) {
          allFiles.push(file);
          exist = true;
        }

        // Check if folder exist
        if (
          file &&
          !exist &&
          allFiles.length == 0 &&
          path != "/" + encodeURI(file.name)
        ) {
          exist = false;
        }

        if (file && path == "/" + encodeURI(file.name)) exist = true;
      });

      if (user) {
        return res.status(200).json({
          stringSession: telegramClient.session.save(),
          data: allFiles,
          exist,
        });
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
