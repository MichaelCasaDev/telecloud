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

export const notToPreview: String[] = [
  "application/zip",
  "application/octet-stream",
];

export const version: string = "v 1.0.0-beta";

export const apiEndpoint: string = String(process.env.NEXT_PUBLIC_API_ENDPOINT);

export const webEndpoint: string = String(process.env.NEXT_PUBLIC_WEB_ENDPOINT);
