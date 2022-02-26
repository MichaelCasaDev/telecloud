import {
  DatabaseAuthType,
  StripeInterface,
  TelegramAuthType,
} from "./lib/types";

export const database: DatabaseAuthType = {
  url: String(process.env.DATABASE_URI),
  collections: {
    files: "files",
    users: "users",
    statistics: "statistics",
  },
  statisticsId: "620933a53d057cdf4919ec06",
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

export const stripe: StripeInterface = {
  apiKey: String(process.env.STRIPE_API_KEY),
  configuration: {
    apiVersion: "2020-08-27",
  },
};

export const CHUNK_MAX_SIZE: number = 2000000000; // 2GB (2000000000) - 10MB [for testing purposes] (10000000)

export const apiEndpoint: string = String(process.env.API_ENDPOINT);

export const uiEndpoint: string = String(process.env.UI_ENDPOINT);
