import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { stripeClientLogin } from "../../../lib/stripe";
import * as config from "../../../config";

module.exports = {
  path: "/api/stripe/success",
  handler: async function handler(req: Request, res: Response) {
    const { session_id } = req.query;

    try {
      const stripeClient = stripeClientLogin();
      const db = (await connectToDatabase()).db();

      const session = await stripeClient.checkout.sessions.retrieve(
        session_id as string,
        {
          expand: ["customer"],
        }
      );

      // Payment not completed
      if (session.payment_status != "paid") {
        throw new Error();
      }

      const telegramId = (session.customer as any).metadata.telegramId;
      const subscription = await stripeClient.subscriptions.retrieve(
        session.subscription as string
      );

      const recurring =
        subscription.items.data[0].price.recurring?.interval || "month";
      const productId = subscription.items.data[0].price.product;
      const product = await stripeClient.products.retrieve(productId as string);

      // Get customer subscriptions
      const customerSub = await stripeClient.subscriptions.list({
        customer: (session.customer as any).id,
      });

      // Delete if present the OLD subscription for the customer
      if (customerSub.data && customerSub.data.length > 1) {
        await stripeClient.subscriptions.del(customerSub.data[1].id);
      }

      // Update user with new subscription in the database
      await db.collection(config.database.collections.users).updateOne(
        { telegramId: String(telegramId) },
        {
          $set: {
            "subscription.plan": String(product.name.toLowerCase()),
            "subscription.type": String(recurring.toLowerCase()),
          },
        }
      );

      res.status(200).redirect("http://localhost:3000/pricing");
    } catch (err) {
      return res.status(500).json({ err });
    }
  },
};
