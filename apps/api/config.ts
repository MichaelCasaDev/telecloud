import { DatabaseAuthType, TelegramAuthType } from "./lib/types";

export const database: DatabaseAuthType = {
  url: String(process.env.DATABASE_URI),
  collections: {
    files: "files",
    users: "users",
  },
};

export const telegram: TelegramAuthType = {
  apiId: Number(process.env.TELEGRAM_API_ID),
  apiHash: String(process.env.TELEGRAM_API_HASH),
  settings: {
    appVersion: "1.0a",
    systemVersion: "Telecloud 1.0a",
    deviceModel: "Telecloud Servers",

    connectionRetries: 5,
    autoReconnect: true,
  },
};
