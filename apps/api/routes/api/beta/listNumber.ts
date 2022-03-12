import { Request, Response } from "express";
import * as config from "../../../config";
import { connectToDatabase } from "../../../lib/database";

module.exports = {
  path: "/api/beta/listnumber",
  handler: async function handler(req: Request, res: Response) {
    const { phone, email } = req.body;
    const db = (await connectToDatabase()).db();
    const nowDateNumber: Number = new Date(Date.now()).getTime();

    if (!config.isBeta) {
      return res.status(500).json({ err: "Not in beta!" });
    }

    if (!phone || !email) {
      return res
        .status(500)
        .json({ err: "Phone number or email not provided!" });
    }

    const normalizedPhone: string = phone.replace(/[-+ ]/g, "");
    const normalizedEmail: string = email.replace(/[ ]/g, "");

    if (normalizedPhone.length != 12) {
      return res.status(500).json({ err: "Phone number invalid!" });
    }

    if (
      !normalizedEmail.includes("@") ||
      !normalizedEmail.includes(".") ||
      normalizedEmail.split(".")[normalizedEmail.split(".").length-1].length < 2
    ) {
      return res.status(500).json({ err: "Email invalid!" });
    }

    try {
      const account = await db
        .collection(config.database.collections.betaAccounts)
        .findOne({
          phone: String(normalizedPhone),
          email: String(normalizedEmail),
        });

      if (!account) {
        await db
          .collection(config.database.collections.betaAccounts)
          .insertOne({
            phone: String(phone),
            email: String(email),
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
