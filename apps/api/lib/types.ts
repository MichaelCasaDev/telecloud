import { Request, Response } from "express";
import Stripe from "stripe";
import { TelegramClientParams } from "telegram/client/telegramBaseClient";

export type TelegramAuthType = {
  apiId: number;
  apiHash: string;
  settings: TelegramClientParams;
};

export type DatabaseAuthType = {
  url: string;
  collections: {
    files: string;
    users: string;
    statistics: string;
    betaAccounts: string;
  };
  statisticsId: string;
};

export type RouteModuleInterface = {
  path: string;
  handler: (req: Request, res: Response) => Promise<void>;
};

export type StripeInterface = {
  apiKey: string;
  configuration: Stripe.StripeConfig;
};

export type FileExpInterface = {
  uuid: string;
  telegramIds: string[];
  name: string;
  size: string;
  type: string;
  lastEdit: string;
};

export type FileInterface = {
  uuid: string;
  path: string;
};

export type UserInterface = {
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
};
