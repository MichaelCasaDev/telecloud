import { Request, Response } from "express";
import { TelegramClientParams } from "telegram/client/telegramBaseClient";

export interface TelegramAuthType {
  apiId: number;
  apiHash: string;
  settings: TelegramClientParams;
}

export interface DatabaseAuthType {
  url: string;
  collections: {
    files: string;
    users: string;
  };
}

export interface routeModuleInterface {
  path: string;
  handler: (req: Request, res: Response) => Promise<void>;
}
