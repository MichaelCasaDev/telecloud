import { TelegramClient } from "telegram";
import { LogLevel } from "telegram/extensions/Logger";
import { StringSession } from "telegram/sessions/StringSession";
import * as config from "../config";
import { connectToDatabase } from "./database";

export async function telegramClientLogin(stringSession: string) {
  const telegramClient = new TelegramClient(
    new StringSession(stringSession),
    config.telegram.apiId,
    config.telegram.apiHash,
    config.telegram.settings
  );

  // Use INFO log level or everything would crash...
  telegramClient.setLogLevel(LogLevel.INFO);

  await telegramClient.connect();

  return telegramClient;
}

export async function isAuthorized(telegramClient: TelegramClient) {
  if (await telegramClient.isUserAuthorized()) {
    const db = (await connectToDatabase()).db();

    const account = await db
      .collection(config.database.collections.users)
      .findOne({
        phone: String(((await telegramClient.getMe()) as any).phone),
      });

    if (account) {
      return true;
    } else {
      return false;
    }
  }

  return false;
}
