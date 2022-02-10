import { Request, Response } from "express";

module.exports = {
  path: "/",
  handler: async function handler(req: Request, res: Response) {
    res.status(200).json({
      message: "Welcome to the API endpoint!",
    });
  },
};
