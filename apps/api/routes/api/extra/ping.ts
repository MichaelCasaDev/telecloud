import { Request, Response } from "express";

module.exports = {
  path: "/api/extra/ping",
  handler: async function handler(req: Request, res: Response) {
    res.status(200).json({
      message: "Hey!",
    });
  },
};
