import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { telegramClientLogin, isAuthorized } from "../../../lib/telegram";
import * as config from "../../../config";
import { stripeClientLogin } from "../../../lib/stripe";
import { UserInterface } from "../../../lib/types";

module.exports = {
  path: "/api/user/update",
  handler: async function handler(req: Request, res: Response) {
    const { stringSession, data } = req.body;
    if (!stringSession || !data || req.method != "POST") {
      return res.status(400).json({
        err: "Request not valid",
      });
    }
    const telegramClient = await telegramClientLogin(stringSession || "");
    const db = (await connectToDatabase()).db();
    const stripeClient = stripeClientLogin();

    if (!(await isAuthorized(telegramClient))) {
      return res.status(401).json({
        err: {
          errorMessage: "NOT_AUTHORIZED",
        },
      });
    }

    try {
      const me: any = await telegramClient.getMe();
      const result = await db
        .collection(config.database.collections.users)
        .findOne({ telegramId: String((me as any).id) }) as any as UserInterface;

      // Update user settings
      if (result) {
        // Check if theres some data to update
        if (Object.keys(data).length != 0) {
          if (data["theme"] != null) {
            await db.collection(config.database.collections.users).updateOne(
              {
                telegramId: String((me as any).id),
              },
              {
                $set: {
                  "settings.theme": String(data["theme"]),
                },
              }
            );
          }

          if (data["filePreview"] != null) {
            await db.collection(config.database.collections.users).updateOne(
              {
                telegramId: String((me as any).id),
              },
              {
                $set: {
                  "settings.filePreview": Boolean(data["filePreview"]),
                },
              }
            );
          }

          if (data["fileDestination"]) {
            await db.collection(config.database.collections.users).updateOne(
              {
                telegramId: String((me as any).id),
              },
              {
                $set: {
                  "settings.fileDestination.name":
                    data["fileDestination"]["name"],
                  "settings.fileDestination.id": data["fileDestination"]["id"],
                },
              }
            );
          }
        } else {
          const name: string = me.firstName + " " + me.lastName;

          // Update name on Stripe
          await stripeClient.customers.update(result.subscription.stripeId, {
            name: name,
          });

          // Update username
          await db.collection(config.database.collections.users).updateOne(
            {
              telegramId: String((me as any).id),
            },
            {
              $set: {
                username: String(me.username),
                name: String(name),
              },
            }
          );
        }

        return res.status(200).json({
          stringSession: telegramClient.session.save(),
          data: "User updated!",
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
