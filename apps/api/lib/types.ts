import { Request, Response } from "express";
import Stripe from "stripe";
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
    statistics: string;
  };
  statisticsId: string;
}

export interface RouteModuleInterface {
  path: string;
  handler: (req: Request, res: Response) => Promise<void>;
}

export interface StripeInterface {
  apiKey: string;
  configuration: Stripe.StripeConfig
}