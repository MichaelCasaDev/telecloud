import { Request, Response } from "express";
import { WithId } from "mongodb";
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
    betaAccounts: string;
  };
  statisticsId: string;
}

export interface RouteModuleInterface {
  path: string;
  handler: (req: Request, res: Response) => Promise<void>;
}

export interface StripeInterface {
  apiKey: string;
  configuration: Stripe.StripeConfig;
}

export interface FileExpInterface extends WithId<Document> {
  uuid: string;
  telegramIds: string[];
  name: string;
  size: string;
  type: string;
  mimeType: string;
  lastEdit: string;
}

export interface FileInterface {
  uuid: string;
  path: string;
}

export interface UserInterface extends WithId<Document> {
  uuid: string;
  telegramId: string;
  telegramToken: string;
  username: string;
  name: string;
  phone: string;
  createdAt: string;
  lastJoinAt: string;
  isBanned: boolean;
  files: FileInterface[];
  usage: {
    now: {
      files: string;
      folders: string;
      space: string;
    };
    total: {
      files: string;
      folders: string;
      space: string;
    };
  };
  settings: {
    theme: "dark" | "light" | "system";
    filePreview: boolean;
    fileDestination: {
      name: string;
      id: string;
    };
  };
  subscription: {
    plan: "starter" | "premium" | "unlimited";
    type: "month" | "year";
    stripeId: string;
  };
  bandwidth: {
    monthlyUsage: string[];
    lastUpdate: string;
  };
  beta: {
    isTester: boolean;
    requestDate: string;
    acceptDate: string;
  };
}
