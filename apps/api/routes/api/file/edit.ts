import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { isNameAvailable } from "../../../lib/isNameAvailable";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import {
  FileExpInterface,
  FileInterface,
  UserInterface,
} from "../../../lib/types";
import { asyncForEach } from "../../../lib/utils";

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
      await telegramClient.disconnect()
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    const file = (await db
      .collection(config.database.collections.files)
      .findOne({
        uuid: String(uuid),
      })) as any as FileExpInterface;

    const user = (await db
      .collection(config.database.collections.users)
      .findOne({
        telegramId: String(((await telegramClient.getMe()) as any).id),
      })) as any as UserInterface;

    if (!(await isNameAvailable(db, telegramClient, name, path, false))) {
      await telegramClient.disconnect()
      return res.status(500).json({
        stringSession: telegramClient.session.save(),
        err: "File or folder name not available!",
      });
    }

    if (file.type == "telecloud/folder") {
      await asyncForEach(user.files, async (item: FileInterface, i: number) => {
        const newPath = path + encodeURI(name);
        const oldPath = path + encodeURI(file.name);
        const fixedPath = item.path.replace(oldPath, newPath);

        if (item.uuid == uuid) return;

        // Update folder name
        await db.collection(config.database.collections.files).updateOne(
          {
            uuid: uuid,
          },
          {
            $set: {
              name: String(name),
            },
          }
        );

        // Remove old file
        await db.collection(config.database.collections.users).updateOne(
          {
            telegramId: String(((await telegramClient.getMe()) as any).id),
          },
          {
            $pull: {
              files: {
                uuid: item.uuid,
                path: oldPath,
              },
            },
          }
        );

        // Rewrite file with new path
        await db.collection(config.database.collections.users).updateOne(
          {
            telegramId: String(((await telegramClient.getMe()) as any).id),
          },
          {
            $push: {
              files: {
                uuid: String(item.uuid),
                path: String(fixedPath),
              },
            },
          }
        );
      });

      await telegramClient.disconnect()
      return res.status(200).json({
        stringSession: telegramClient.session.save(),
        data: {
          message: "Folder updated!!",
          uuid: uuid,
          newName: name,
          lastEdit: lastEdit,
        },
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

    await telegramClient.disconnect()
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
