import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import * as config from "../../../config";
import { ObjectId } from "mongodb";

module.exports = {
  path: "/api/public/statistics",
  handler: async function handler(req: Request, res: Response) {
    const db = (await connectToDatabase()).db();

    try {
      const result: any = await db
        .collection(config.database.collections.statistics)
        .findOne({ _id: new ObjectId(config.database.statisticsId) });

      delete result["_id"];
      return res.status(200).json({ data: result });
    } catch (err) {
      return res.status(500).json({ err });
    }
  },
};
