import { TelegramClient } from "telegram";
import { asyncForEach } from "./utils";

export async function isNameAvailable(
  db: any,
  telegramClient: TelegramClient,
  name: string,
  path: string,
  isFolder: boolean
) {
  let available: boolean = true;
  const user: any = await db.collection("users").findOne({
    telegramId: String(((await telegramClient.getMe()) as any).id),
  });

  await asyncForEach(user.files, async (e: any, i: number) => {
    const fileA: any = await db.collection("files").findOne({
      uuid: String(e.uuid),
    });

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
