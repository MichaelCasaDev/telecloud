export interface CookiesType {
  stringSession: {
    name: string;
    expire: number;
    path: string;
  };
  sortOrder: {
    name: string;
    expire: number;
    path: string;
  };
  sortType: {
    name: string;
    expire: number;
    path: string;
  };
  moveFile: {
    name: string;
    path: string;
  };
  pasteFile: {
    name: string;
    path: string;
  };
}
