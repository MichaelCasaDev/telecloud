import { Db, MongoClient, ObjectId } from "mongodb";
import { TelegramClient } from "telegram";
import * as config from "../config";
import { stripeClientLogin } from "./stripe";
import { v4 as uuidv4 } from "uuid";

export async function connectToDatabase() {
  const client = await MongoClient.connect(config.database.url, {});

  return client;
}

export async function createUserDatabase(
  db: Db,
  telegramClient: TelegramClient
) {
  const me: any = await telegramClient.getMe();

  const userX = await db.collection(config.database.collections.users).findOne({
    uuid: String(me.id),
  });

  // Create user in the database if not exists
  if (!userX) {
    const nowDateNumber: Number = new Date(Date.now()).getTime();
    const uuid: String = uuidv4();
    const name: string = me.firstName + " " + me.lastName;

    // Create a new customer in Stripe
    const stripeClient = stripeClientLogin();
    const customer = await stripeClient.customers.create({
      name: name,
      metadata: {
        telegramId: String(me.id),
      },
    });

    // Push some other informations
    await stripeClient.customers.update(customer.id, {
      metadata: {
        uuid: String(uuid),
      },
    });

    await db.collection(config.database.collections.users).insertOne({
      uuid: String(uuid),
      telegramId: String(me.id),
      username: String(me.username),
      name: String(name),
      createdAt: Number(nowDateNumber),
      isBanned: Boolean(false),
      files: [],
      usage: {
        totFiles: Number(0),
        totFolders: Number(0),
        totSpace: Number(0),
      },
      settings: {
        theme: String("system"),
        fileDestination: {
          name: String("Saved messages"),
          id: String("me"),
        },
        filePreview: Boolean(true),
      },
      subscription: {
        plan: String("starter"),
        type: String("month"),
        stripeId: String(customer.id),
      },
      bandwidth: {
        monthlyUsage: [0],
        lastUpdate: Number(nowDateNumber),
      },
    });

    /* ####################### */
    // Update global statistics
    /* ####################### */

    await db.collection(config.database.collections.statistics).updateOne(
      {
        _id: new ObjectId(config.database.statisticsId),
      },
      {
        $inc: {
          totalUsers: 1,
        },
      }
    );
  }
}
