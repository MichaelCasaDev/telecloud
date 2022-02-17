import { Request, Response } from "express";
import { Form } from "multiparty";
import { CustomFile } from "telegram/client/uploads";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import { connectToDatabase } from "../../../lib/database";
import { openSync, read, remove, statSync } from "fs-extra";
import { isNameAvailable } from "../../../lib/isNameAvailable";
import * as configX from "../../../config";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

module.exports = {
  path: "/api/file/upload",
  handler: async function handler(req: Request, res: Response) {
    const options = {
      autoFields: true,
      autoFiles: true,
      uploadDir: "/Users/michaelcasa/Desktop/GitHub/telecloud/apps/api/tmp", // Define a custom folder where save temporary files during upload
    };

    // Promise everything to way until all datas are uploaded and processed
    await new Promise((resolve) => {
      new Form(options).parse(req, async (err, fields, files) => {
        const { stringSession, path, isFolder, name, lastEdit } = fields;

        if (
          !stringSession ||
          !path ||
          !isFolder ||
          !name ||
          !lastEdit ||
          req.method != "POST"
        ) {
          return res.status(400).json({
            message: "Request not valid",
          });
        }

        const telegramClient = await telegramClientLogin(
          String(stringSession[0]) || ""
        );
        const db = (await connectToDatabase()).db();

        if (!(await isAuthorized(telegramClient))) {
          resolve(0);
          return res.status(401).json({
            message: "Not authorized!!",
          });
        }

        /* ####################### */
        // Upload file as folder
        /* ####################### */
        if (String(isFolder[0]) == "true") {
          // Check if folder name is available
          if (
            !(await isNameAvailable(db, telegramClient, name[0], path[0], true))
          ) {
            return res.status(500).json({
              stringSession: telegramClient.session.save(),
              err: "Folder name not available!",
            });
          }

          try {
            const fileUuid = uuidv4();

            // Create file in the database
            await db.collection(configX.database.collections.files).insertOne({
              uuid: String(fileUuid),
              telegramId: String("-"),
              name: String(name[0]),
              size: String("0"),
              type: String("-"),
              lastEdit: String(lastEdit),
              isFolder: Boolean(true),
            });

            // Update users files list in the database
            await db.collection(configX.database.collections.users).updateOne(
              {
                telegramId: String(((await telegramClient.getMe()) as any).id),
              },
              {
                $push: {
                  files: {
                    uuid: String(fileUuid),
                    path: String(path[0]),
                  },
                },
              }
            );

            /* ####################### */
            // Update users stats
            /* ####################### */
            const user: any = await db
              .collection(configX.database.collections.users)
              .findOne({
                telegramId: String(((await telegramClient.getMe()) as any).id),
              });

            await db.collection(configX.database.collections.users).updateOne(
              {
                telegramId: String(((await telegramClient.getMe()) as any).id),
              },
              {
                $set: {
                  usage: {
                    totFiles: String(Number(user.usage.totFiles)),
                    totFolders: String(Number(user.usage.totFolders) + 1),
                    totSpace: String(Number(user.usage.totSpace)),
                  },
                },
              }
            );

            resolve(0);
            return res
              .status(200)
              .json({ stringSession: telegramClient.session.save() });
          } catch (err) {
            resolve(0);
            return res
              .status(500)
              .json({ stringSession: telegramClient.session.save(), err });
          }
        }

        /* ####################### */
        // Upload file
        /* ####################### */

        if (Object.keys(files).length == 0) {
          return res.status(500).json({
            stringSession: telegramClient.session.save(),
            err: "Files not provided",
          });
        }

        const fileX = files.file[0];
        const fileUuid = uuidv4();

        let chunks = {
          telegramIds: [] as String[],
          size: files.file[0].size as Number,
        };

        try {
          const user: any = await db
            .collection(configX.database.collections.users)
            .findOne({
              telegramId: String(((await telegramClient.getMe()) as any).id),
            });

          // Check if file name is available (TODO: also done from client-side)
          if (
            !(await isNameAvailable(
              db,
              telegramClient,
              fileX.originalFilename,
              path[0],
              String(isFolder[0]) == "true"
            ))
          ) {
            // delete file from TMP folder
            await remove(fileX.path);

            resolve(0);
            return res.status(500).json({
              stringSession: telegramClient.session.save(),
              err: "File not uploaded!",
            });
          }

          // Limits based per subscription
          const tmpNewUsage = user.bandwidth.monthlyUsage[0] + files.file[0].size;
          const maxGB =
            user.subscription.plan == "starter"
              ? 50000000000 // 50 GB
              : user.subscription.plan == "premium"
              ? 200000000000 // 200 GB
              : user.subscription.plan == "unlimited"
              ? -100 // Unlimited GB
              : null;

          // Continue to upload (bandwidth limit)
          if (maxGB && (maxGB == -100 || tmpNewUsage < maxGB)) {
            // Uplaod file in chunks
            for await (const chunk of generateChunks(
              fileX.path,
              configX.CHUNK_MAX_SIZE
            )) {
              // Convert file to CustomFile for telegram upload
              const file = new CustomFile(
                fileX.originalFilename +
                  (files.file[0].size > configX.CHUNK_MAX_SIZE
                    ? ".part" + chunks.telegramIds.length
                    : ""),
                chunk.length,
                "",
                chunk
              );

              // Upload to Telegram servers
              const fileUp = await telegramClient.uploadFile({
                file: file,
                workers: 1,
              });

              // Send to user "Saved Messages" chat
              const result = await telegramClient.sendFile(
                user.settings.fileDestination.id,
                {
                  file: fileUp,
                  caption: "Uploaded with Telecloud",
                  forceDocument: true,
                  workers: 1,
                }
              );

              // Save the chunks id
              chunks.telegramIds.push(String(result.id));
            }
          } else {
            // delete file from TMP folder
            await remove(fileX.path);

            resolve(0);
            return res.status(500).json({
              stringSession: telegramClient.session.save(),
              err: "File not uploaded!",
            });
          }

          // Create file in the database
          await db.collection(configX.database.collections.files).insertOne({
            uuid: String(fileUuid),
            telegramIds: [...chunks.telegramIds],
            name: String(fileX.originalFilename),
            size: String(chunks.size),
            parts: String(chunks.telegramIds.length),
            type: String(fileX.headers["content-type"]),
            lastEdit: String(lastEdit[0]),
            isFolder: Boolean(false),
          });

          // Update users files list in the database
          await db.collection(configX.database.collections.users).updateOne(
            {
              telegramId: String(((await telegramClient.getMe()) as any).id),
            },
            {
              $push: {
                files: {
                  uuid: String(fileUuid),
                  path: String(path[0]),
                },
              },
            }
          );

          /* ####################### */
          // Update users stats
          /* ####################### */
          await db.collection(configX.database.collections.users).updateOne(
            {
              telegramId: String(((await telegramClient.getMe()) as any).id),
            },
            {
              $set: {
                usage: {
                  totFiles: String(Number(user.usage.totFiles) + 1),
                  totFolders: String(Number(user.usage.totFolders)),
                  totSpace: String(
                    Number(user.usage.totSpace) + Number(chunks.size)
                  ),
                },
              },
            }
          );

          /* ####################### */
          // Update global statistics
          /* ####################### */

          await db
            .collection(configX.database.collections.statistics)
            .updateOne(
              {
                _id: new ObjectId(configX.database.statisticsId),
              },
              {
                $inc: {
                  totalFiles: 1,
                  totalBandwidth: chunks.size,
                },
              }
            );

          // Update month usage
          const dbDate = new Date(user.bandwidth.lastUpdate);
          const dbMonth = dbDate.getMonth();

          const nowDate = new Date(Date.now());
          const nowMonth = nowDate.getMonth();

          // Check if need to create a new month
          if (nowMonth != dbMonth) {
            await db.collection(configX.database.collections.users).updateOne(
              {
                telegramId: String(((await telegramClient.getMe()) as any).id),
              },
              {
                $push: {
                  "bandwidth.monthUsage": {
                    $each: [Number(chunks.size)],
                    $position: 0,
                  },
                },
                $set: {
                  "bandwidth.lastUpdate": Number(nowDate.getTime()),
                },
              }
            );
          } else {
            await db.collection(configX.database.collections.users).updateOne(
              {
                telegramId: String(((await telegramClient.getMe()) as any).id),
              },
              {
                $inc: {
                  "bandwidth.monthUsage.0": Number(chunks.size),
                },
                $set: {
                  "bandwidth.lastUpdate": Number(nowDate.getTime()),
                },
              }
            );
          }

          // delete file from TMP folder
          await remove(fileX.path);

          resolve(0);
          return res
            .status(200)
            .json({ stringSession: telegramClient.session.save() });
        } catch (err) {
          // delete file from TMP folder
          await remove(fileX.path);

          console.log(err);

          resolve(0);
          return res
            .status(500)
            .json({ stringSession: telegramClient.session.save(), err });
        }
      });
    });
  },
};

// Functions to create chunks from a file path
async function* generateChunks(filePath: string, size: number) {
  const sharedBuffer = Buffer.alloc(size);
  const stats = statSync(filePath); // file details
  const fd = openSync(filePath, "r"); // file descriptor
  let bytesRead = 0; // how many bytes were read
  let end = size;

  for (let i = 0; i < Math.ceil(stats.size / size); i++) {
    await readBytes(fd, sharedBuffer);
    bytesRead = (i + 1) * size;
    if (bytesRead > stats.size) {
      // When we reach the end of file,
      // we have to calculate how many bytes were actually read
      end = size - (bytesRead - stats.size);
    }
    yield sharedBuffer.slice(0, end);
  }
}

function readBytes(fd: number, sharedBuffer: Buffer) {
  return new Promise((resolve, reject) => {
    read(fd, sharedBuffer, 0, sharedBuffer.length, null, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(0);
    });
  });
}
