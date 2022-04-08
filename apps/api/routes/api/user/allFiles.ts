import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import { filesFromPath } from "../../../lib/filesFromPath";
import { UserInterface } from "../../../lib/types";

module.exports = {
  path: "/api/user/allfiles",
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
      const user = (await db
        .collection(config.database.collections.users)
        .findOne({
          telegramId: String((me as any).id),
        })) as any as UserInterface;

      let exist: boolean = path == "/" ? true : false;

      // Find the folders and subfolders and save ALL files
      let { files, totFolders, totFiles, totSpace } = await filesFromPath(
        path,
        user,
        db
      );

      if (user) {
        return res.status(200).json({
          data: {
            files,
            totFolders,
            totFiles,
            totSpace,
          },
          exist,
        });
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
