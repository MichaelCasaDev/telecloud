import { Db } from "mongodb";
import { TelegramClient } from "telegram";
import { FileExpInterface, FileInterface, UserInterface } from "./types";
import { asyncForEach } from "./utils";

export async function isNameAvailable(
  db: Db,
  telegramClient: TelegramClient,
  name: string,
  path: string,
  isFolder: boolean
) {
  let available: boolean = true;
  const user = await db.collection("users").findOne({
    telegramId: String(((await telegramClient.getMe()) as any).id),
  }) as UserInterface;

  await asyncForEach(user.files, async (e: FileInterface, i: number) => {
    const fileA = (await db.collection("files").findOne({
      uuid: String(e.uuid),
    })) as any as FileExpInterface;

    const isFolder0: boolean = fileA.type == "telecloud/folder";

    if (
      (fileA.name == name && e.path == path && isFolder0 && isFolder) || // For files
      (fileA.name == name && e.path == path && !isFolder0 && !isFolder) // For folders
    ) {
      available = false;
    }
  });

  return available;
}
