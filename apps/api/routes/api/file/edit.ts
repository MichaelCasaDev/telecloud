import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { isNameAvailable } from "../../../lib/isNameAvailable";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import { FileExpInterface } from "../../../lib/types";

module.exports = {
  path: "/api/file/edit",
  handler: async function handler(req: Request, res: Response) {
    const { uuid, lastEdit, path, name, stringSession } = req.body;

    if (
      !stringSession ||
      !path ||
      !name ||
      !lastEdit ||
      !uuid ||
      req.method != "POST"
    ) {
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

    const file = await db
      .collection(config.database.collections.files)
      .findOne({
        uuid: String(uuid),
      }) as any as FileExpInterface;

    if (file.type == "telecloud/folder") {
      return res.status(500).json({
        stringSession: telegramClient.session.save(),
        err: "Renaming folder is not possible at the moment",
      });
    }

    if (!(await isNameAvailable(db, telegramClient, name, path, false))) {
      return res.status(500).json({
        stringSession: telegramClient.session.save(),
        err: "File or folder name not available!",
      });
    }

    await db.collection(config.database.collections.files).updateOne(
      {
        uuid: String(uuid),
      },
      {
        $set: {
          name: String(name),
          lastEdit: String(lastEdit),
        },
      }
    );

    return res.status(200).json({
      stringSession: telegramClient.session.save(),
      data: {
        message: "File updated!!",
        uuid: uuid,
        newName: name,
        lastEdit: lastEdit,
      },
    });
  },
};
