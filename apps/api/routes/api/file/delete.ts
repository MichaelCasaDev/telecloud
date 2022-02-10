import { Db } from "mongodb";
import { Request, Response } from "express";
import { Api } from "telegram";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import { asyncForEach } from "../../../lib/utils";
import * as config from "../../../config";

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
    if (file && file.isFolder) {
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
        if (!fileX.isFolder) {
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
            usage: {
              totFiles: String(Number(user.usage.totFiles) - totFiles),
              totFolders: String(Number(user.usage.totFolders) - totFolders),
              totSpace: String(Number(user.usage.totSpace) - totSpace),
            },
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
            usage: {
              totFiles: String(Number(user.usage.totFiles) - 1),
              totFolders: String(Number(user.usage.totFolders)),
              totSpace: String(Number(user.usage.totSpace) - Number(file.size)),
            },
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

async function filesFromPath(path: string, user: any, folder: any, db: Db) {
  let totFiles = 0;
  let totSpace = 0;
  let totFolders = 1;
  let files: any[] = [folder];

  let f0: any[] = [];

  // find folder and save file
  await asyncForEach(user.files, async (el: any, i: number) => {
    if (el.path == path + folder.name) {
      let x = await db.collection(config.database.collections.files).findOne({
        uuid: String(el.uuid),
      });

      if (x) {
        if (x.isFolder) {
          f0.push(x);
          files.push(x);

          totFolders++;
        } else {
          files.push(x);

          totFiles++;
          totSpace += Number(x.size);
        }
      }
    }
  });

  // Delete subfolder and files
  if (f0.length > 0) {
    let i = 0;
    let pathx = path + folder.name;

    do {
      pathx += "/" + f0[i].name;

      await asyncForEach(user.files, async (el: any, i: number) => {
        if (el.path == pathx) {
          let x = await db
            .collection(config.database.collections.files)
            .findOne({
              uuid: String(el.uuid),
            });

          if (x) {
            if (x.isFolder) {
              f0.push(x);
              i++;
              files.push(x);

              totFolders++;
            } else {
              files.push(x);

              totFiles++;
              totSpace += Number(x.size);
            }
          }
        }
      });

      f0.shift();
    } while (f0.length != 0);
  }

  return { files, totFolders, totFiles, totSpace };
}
