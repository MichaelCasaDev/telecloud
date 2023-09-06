import { CookiesType } from "./lib/types";

export const cookies: CookiesType = {
  stringSession: {
    name: "stringSession",
    expire: 31556952000,
    path: "/",
  },
  sortOrder: {
    name: "sortOrder",
    expire: 31556952000,
    path: "/",
  },
  sortType: {
    name: "sortType",
    expire: 31556952000,
    path: "/",
  },
  moveFile: {
    name: "moveFile",
    path: "/",
  },
  pasteFile: {
    name: "pasteFile",
    path: "/",
  },
};

export const isBeta: boolean = false;

export const previewCustom: String[] = ["application/pdf"];

export const version: string = "v 1.0.0-alpha";

export const apiEndpoint: string = String(process.env.NEXT_PUBLIC_API_ENDPOINT);

export const webEndpoint: string = String(process.env.NEXT_PUBLIC_WEB_ENDPOINT);
