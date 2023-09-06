import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import { isNameAvailable } from "../../../lib/isNameAvailable";
import { v4 as uuidv4 } from "uuid";
import { FileLike } from "telegram/define";
import {
  FileExpInterface,
  FileInterface,
  UserInterface,
} from "../../../lib/types";

module.exports = {
  path: "/api/file/move",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession, uuid, path, newPath, operation } = req.body;

    if (
      !stringSession ||
      !path ||
      !uuid ||
      !newPath ||
      !operation ||
      req.method != "POST"
    ) {
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
      const user = (await db.collection("users").findOne({
        telegramId: String((me as any).id),
      })) as any as UserInterface;

      // Check if file is in user array
      user.files.forEach((e: FileInterface) => {
        if (e.uuid == uuid) found = true;
      });

      if (!found) {
        return res.status(404).json({
          err: "File not found!!",
        });
      }

      // Search file in db
      const result = (await db
        .collection(config.database.collections.files)
        .findOne({
          uuid: String(uuid),
        })) as any as FileExpInterface;

      if (!result) {
        return res.status(404).json({
          err: "File not found!!",
        });
      }

      if (result.type == "telecloud/folder") {
        return res.status(300).json({
          err: "Cannot move folder now!!",
        });
      }

      if (
        !(await isNameAvailable(
          db,
          telegramClient,
          result.name,
          newPath,
          false
        ))
      ) {
        await telegramClient.disconnect()
        return res.status(500).json({
          err: "File or folder name not available!",
        });
      }

      switch (String(operation)) {
        case "cut": {
          // Remove old file
          await db.collection(config.database.collections.users).updateOne(
            {
              telegramId: String(((await telegramClient.getMe()) as any).id),
            },
            {
              $pull: {
                files: {
                  uuid: uuid,
                  path: path,
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
                  uuid: String(uuid),
                  path: String(newPath),
                },
              },
            }
          );
          await telegramClient.disconnect()
          return res.status(200).json({
            stringSession: telegramClient.session.save(),
            data: "File moved (cut) successfully!",
          });
        }
        case "copy": {
          // Merge different chunks of file into one
          let arrayFiles: FileLike[] = [];
          let arrayTelegramIds: String[] = [];

          for await (const telegramId of result.telegramIds) {
            // Get the existing file from the telegram chat
            const file = await telegramClient.getMessages(
              user.settings.fileDestination.id,
              {
                ids: [Number(telegramId)],
              }
            );

            if (file[0].media) {
              arrayFiles.push(file[0].media);
            }
          }

          // Generate a new message with already uploaded file from telegram clouds
          for await (const telegramFile of arrayFiles) {
            const newFile = await telegramClient.sendFile(
              user.settings.fileDestination.id,
              {
                file: telegramFile,
                caption: "Uploaded with Telecloud",
                forceDocument: true,
                workers: 1,
              }
            );

            arrayTelegramIds.push(String(newFile.id));
          }

          const fileUuid = uuidv4();

          // Create file in the database
          await db.collection(config.database.collections.files).insertOne({
            uuid: String(fileUuid),
            telegramIds: [...arrayTelegramIds],
            name: String(result.name),
            size: String(result.size),
            type: String(result.type),
            mimeType: String(result.mimeType),
            lastEdit: String(result.lastEdit),
            isFolder: Boolean(false),
          });

          // Update users files list in the database
          await db.collection(config.database.collections.users).updateOne(
            {
              telegramId: String(((await telegramClient.getMe()) as any).id),
            },
            {
              $push: {
                files: {
                  uuid: String(fileUuid),
                  path: String(newPath),
                },
              },
            }
          );

          /* ####################### */
          // Update users stats
          /* ####################### */
          await db.collection(config.database.collections.users).updateOne(
            {
              telegramId: String(((await telegramClient.getMe()) as any).id),
            },
            {
              $set: {
                "usage.now.files": String(Number(user.usage.now.files) + 1),
                "usage.now.space": String(
                  Number(user.usage.now.space) + Number(result.size)
                ),
                "usage.total.files": String(Number(user.usage.total.files) + 1),
                "usage.total.space": String(
                  Number(user.usage.total.space) + Number(result.size)
                ),
              },
            }
          );
          await telegramClient.disconnect()
          return res.status(200).json({
            stringSession: telegramClient.session.save(),
            data: "File moved (copy) successfully!",
          });
        }
        default: {await telegramClient.disconnect()
          return res.status(500).json({
            stringSession: telegramClient.session.save(),
            err: "Operation not valid!",
          });
        }
      }
    } catch (err) {await telegramClient.disconnect()
      return res
        .status(500)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
