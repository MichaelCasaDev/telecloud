import { Request, Response } from "express";
import * as config from "../../../config";
import { connectToDatabase } from "../../../lib/database";

module.exports = {
  path: "/api/beta/listnumber",
  handler: async function handler(req: Request, res: Response) {
    const { phone } = req.body;
    const db = (await connectToDatabase()).db();
    const nowDateNumber: Number = new Date(Date.now()).getTime();

    if (!config.isBeta) {
      return res.status(500).json({ err: "Not in beta!" });
    }

    if (!phone || (phone as string).length != 12) {
      return res.status(500).json({ err: "Phone number invalid!" });
    }

    try {
      const account = await db
        .collection(config.database.collections.betaAccounts)
        .findOne({
          phone: String(phone),
        });

      if (!account) {
        await db
          .collection(config.database.collections.betaAccounts)
          .insertOne({
            phone: String(phone),
            accepted: Boolean(false),
            requestDate: String(nowDateNumber),
            acceptDate: String(""),
          });

        return res.status(200).json({ data: "Number listed!" });
      } else {
        return res.status(500).json({ err: "Number already listed!" });
      }
    } catch (err) {
      return res.status(500).json({ err });
    }
  },
};
