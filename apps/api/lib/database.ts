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
    telegramId: String(me.id),
  });

  // Create user in the database if not exists
  if (!userX) {
    const nowDateNumber: Number = new Date(Date.now()).getTime();
    const uuid: String = uuidv4();
    const name: string = (me.firstName || "") + " " + (me.lastName || "");

    // Create a new customer in Stripe
    const stripeClient = stripeClientLogin();
    const customer = await stripeClient.customers.create({
      name: name,
      metadata: {
        telegramId: String(me.id),
        uuid: String(uuid),
      },
    });

    const betaAccount = await db
      .collection(config.database.collections.betaAccounts)
      .findOne({
        phone: String(me.phone),
      });

    await db.collection(config.database.collections.users).insertOne({
      uuid: String(uuid),
      telegramId: String(me.id),
      telegramToken: String(""),
      username: String(me.username),
      name: String(name),
      phone: String(me.phone),
      createdAt: String(nowDateNumber),
      lastJoinAt: String(nowDateNumber),
      isBanned: Boolean(false),
      files: [],
      usage: {
        now: {
          files: String(0),
          folders: String(0),
          space: String(0),
        },
        total: {
          files: String(0),
          folders: String(0),
          space: String(0),
        },
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
        lastUpdate: String(nowDateNumber),
      },
      beta: {
        isTester: Boolean(betaAccount && betaAccount.accepted),
        requestDate: betaAccount ? String(betaAccount.requestDate) : String(""),
        acceptDate:
          betaAccount && betaAccount.accepted
            ? String(betaAccount.acceptDate)
            : String(""),
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
