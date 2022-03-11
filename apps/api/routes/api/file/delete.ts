import { Request, Response } from "express";
import { Api } from "telegram";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import { asyncForEach } from "../../../lib/utils";
import * as config from "../../../config";
import { filesFromPath } from "../../../lib/filesFromPath";

module.exports = {
  path: "/api/file/delete",
  handler: async function handler(req: Request, res: Response) {
    const { uuid, stringSession, path } = req.body;
    if (!stringSession || !uuid || !path || req.method != "POST") {
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
    const file: any = await db
      .collection(config.database.collections.files)
      .findOne({
        uuid: String(uuid),
      });

    // A Folder
    if (file && file.type == "telecloud/folder") {
      const user: any = await db
        .collection(config.database.collections.users)
        .findOne({
          telegramId: String(((await telegramClient.getMe()) as any).id),
        });

      // Find the folders and subfolders and save ALL files
      let { files, totFolders, totFiles, totSpace } = await filesFromPath(
        path,
        user,
        file,
        db
      );

      // Delete from database and telegram
      await asyncForEach(files, async (e: any, i: number) => {
        const fileX: any = await db
          .collection(config.database.collections.files)
          .findOne({
            uuid: String(e.uuid),
          });

        // Remove files from database
        await db.collection(config.database.collections.files).deleteOne({
          uuid: fileX.uuid,
        });

        // Also remove from user files list
        await db.collection(config.database.collections.users).updateOne(
          {
            telegramId: String(((await telegramClient.getMe()) as any).id),
          },
          {
            $pull: {
              files: {
                uuid: e.uuid,
              },
            },
          }
        );

        // Finally delete files from telegram
        if (fileX.type != "telecloud/folder") {
          for await (const telegramId of fileX.telegramIds) {
            await telegramClient.invoke(
              new Api.messages.DeleteMessages({
                id: [Number(telegramId)],
              })
            );
          }
        }
      });

      /* ####################### */
      // Update users stats
      /* ####################### */

      await db.collection(config.database.collections.users).updateOne(
        {
          telegramId: String(((await telegramClient.getMe()) as any).id),
        },
        {
          $set: {
            "usage.now.files": String(Number(user.usage.now.files) - totFiles),
            "usage.now.folders": String(
              Number(user.usage.now.folders) - totFolders
            ),
            "usage.now.space": String(Number(user.usage.now.space) - totSpace),
          },
        }
      );

      return res.status(200).json({
        stringSession: telegramClient.session.save(),
        message: {
          files,
          totFolders,
          totFiles,
          totSpace,
        },
      });
    }

    // Not a Folder
    try {
      // Remove file from database
      await db.collection(config.database.collections.files).deleteOne({
        uuid: String(uuid),
      });

      // Remove file from user files list database
      await db.collection(config.database.collections.users).updateOne(
        {
          telegramId: String(((await telegramClient.getMe()) as any).id),
        },
        {
          $pull: {
            files: {
              uuid: String(uuid),
            },
          },
        }
      );

      /* ####################### */
      // Update users stats
      /* ####################### */
      const user: any = await db
        .collection(config.database.collections.users)
        .findOne({
          telegramId: String(((await telegramClient.getMe()) as any).id),
        });

      await db.collection(config.database.collections.users).updateOne(
        {
          telegramId: String(((await telegramClient.getMe()) as any).id),
        },
        {
          $set: {
            "usage.now.files": String(Number(user.usage.now.files) - 1),
            "usage.now.space": String(
              Number(user.usage.now.space) - Number(file.size)
            ),
          },
        }
      );

      // Delete the selected messages
      for await (const telegramId of file.telegramIds) {
        await telegramClient.invoke(
          new Api.messages.DeleteMessages({
            id: [Number(telegramId)],
          })
        );
      }

      if (file) {
        return res.status(200).json({
          stringSession: telegramClient.session.save(),
          message: "File deleted!",
        });
      } else {
        return res.status(400).json({
          stringSession: telegramClient.session.save(),
          err: "File(s) not found!!",
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
