import { TelegramClient } from "telegram";
import { LogLevel } from "telegram/extensions/Logger";
import { StringSession } from "telegram/sessions/StringSession";
import * as config from "../config";

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
    return true;
  }

  return false;
}
