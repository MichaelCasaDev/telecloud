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

export const notToPreview: String[] = ["application/zip"];
