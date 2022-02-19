import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";

module.exports = {
  path: "/api/file/get/:name",
  handler: async function handler(req: Request, res: Response) {
    const { uuid, stringSession, download } = req.query;

    if (!stringSession || !uuid || req.method != "GET") {
      return res.status(400).json({
        err: "Request not valid",
      });
    }

    const telegramClient = await telegramClientLogin(
      // Decode stringsession from base64 to utf-8 (in future this will be crypted)
      Buffer.from(String(stringSession), "base64").toString("utf-8") || ""
    );
    const db = (await connectToDatabase()).db();

    if (!(await isAuthorized(telegramClient))) {
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      // Get file datas from database
      const file: any = await db
        .collection(config.database.collections.files)
        .findOne({
          uuid: String(uuid),
        });

      // TODO: Implement support to download folders (need to zip files and then send to the client)
      if (file.type == "telecloud/folder") {
        return res.status(500).json({
          stringSession: telegramClient.session.save(),
          err: "Cannot download folders at the moment",
        });
      }

      // Download the file from telegram
      const fileName = file.name.replaceAll(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
      );

      download == "true"
        ? res.setHeader(
            "Content-Disposition",
            `attachment; filename=${fileName}`
          )
        : null;

      res
        .status(200)
        .setHeader("File-Name", fileName)
        .setHeader("Content-Type", file.type)
        .setHeader("Content-Length", file.size);

      // Merge different chunks of file into one
      for await (const telegramId of file.telegramIds) {
        // Get file message from telegram
        const result = await telegramClient.getMessages("me", {
          ids: [Number(telegramId)],
        });

        if (result[0].media) {
          // Download the file from telegram
          const buff = await telegramClient.downloadMedia(result[0].media, {});

          // Push data to response
          res.write(buff);
        }
      }

      // Send the file to the client (as an attachment)
      return res.end();
    } catch (err) {
      return res
        .status(200)
        .json({ stringSession: telegramClient.session.save(), err });
    }
  },
};
