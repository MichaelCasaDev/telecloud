import { Db } from "mongodb";
import { asyncForEach } from "./utils";
import * as config from "../config";

export async function filesFromPath(
  path: string,
  user: any,
  folder: any,
  db: Db
) {
  let totFiles = 0;
  let totSpace = 0;
  let totFolders = 1;
  let files: any[] = [];

  // Could instanciate a base folder if needed
  if (folder != null) {
    files[0] = folder;
  }

  let f0: any[] = [];

  // Find base folders and files from {path}
  await asyncForEach(user.files, async (el: any, i: number) => {
    if (el.path == path + (folder ? encodeURI(folder.name) : "")) {
      let x = await db.collection(config.database.collections.files).findOne({
        uuid: String(el.uuid),
      });

      if (x) {
        // Find folder to do opertaion next
        if (x.type == "telecloud/folder") {
          f0.push(x);
          files.push(x);

          totFolders++;
        } else {
          // Save file to array
          files.push(x);

          totFiles++;
          totSpace += Number(x.size);
        }
      }
    }
  });

  // Retrive subfolder and files
  if (f0.length > 0) {
    let i = 0;
    let pathx = path + (folder ? encodeURI(folder.name) : "");

    do {
      pathx += "/" + encodeURI(f0[i].name);

      await asyncForEach(user.files, async (el: any, i: number) => {
        if (el.path == pathx) {
          let x = await db
            .collection(config.database.collections.files)
            .findOne({
              uuid: String(el.uuid),
            });

          if (x) {
            // Find folder to do opertaion next
            if (x.type == "telecloud/folder") {
              f0.push(x);
              i++;
              files.push(x);

              totFolders++;
            } else {
              // Save file to array
              files.push(x);

              totFiles++;
              totSpace += Number(x.size);
            }
          }
        }
      });

      f0.shift();
    } while (f0.length != 0);
  }

  return { files, totFolders, totFiles, totSpace };
}
