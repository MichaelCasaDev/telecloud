import { Request, Response } from "express";
import { connectToDatabase } from "../../../lib/database";
import { stripeClientLogin } from "../../../lib/stripe";
import { telegramClientLogin } from "../../../lib/telegram";
import * as config from "../../../config";

module.exports = {
  path: "/api/stripe/create-checkout-session",
  handler: async function handler(req: Request, res: Response) {
    const { plan, type, stringSession } = req.query;

    try {
      const stripeClient = stripeClientLogin();
      const db = (await connectToDatabase()).db();
      const telegramClient = await telegramClientLogin(
        atob(stringSession as string) || ""
      );

      const me = await telegramClient.getMe();
      const result: any = await db
        .collection(config.database.collections.users)
        .findOne({ telegramId: String((me as any).id) });

      if (!result) {
        return res.status(400).json({
          stringSession: telegramClient.session.save(),
          err: "USER_NOT_FOUND",
        });
      }

      let priceId = "";

      // Get priceId of selected plan based on his name and type
      if (type == "month") {
        priceId =
          plan == "premium"
            ? "price_1KILGADSDq7W52lUy9Tza9D8"
            : plan == "unlimited"
            ? "price_1KL3emDSDq7W52lURWEMyPEb"
            : "";
      } else if (type == "year") {
        priceId =
          plan == "premium"
            ? "price_1KKjsHDSDq7W52lUcEWXhCos"
            : plan == "unlimited"
            ? "price_1KL43ADSDq7W52lUXj2W4Plg"
            : "";
      }
      // Check if new plan is the same as already own by the user
      if (
        plan == result.subscription.plan &&
        type == result.subscription.type
      ) {
        return res.redirect(config.uiEndpoint + "/pricing");
      }

      // Redirect back to /pricing if plan is starter or invalid
      if (priceId == "" || plan == "starter") {
        if (plan == "starter") {
          // Update user with new subscription in the database
          await db.collection(config.database.collections.users).updateOne(
            { telegramId: String(result.telegramId) },
            {
              $set: {
                "subscription.plan": String("starter"),
                "subscription.type": String(""),
              },
            }
          );

          // Get customer subscriptions
          const customerSub = await stripeClient.subscriptions.list({
            customer: result.subscription.stripeId,
          });

          // Delete if present the OLD subscription for the customer
          if (customerSub.data && customerSub.data.length > 0) {
            await stripeClient.subscriptions.del(customerSub.data[0].id);
          }
        }

        return res.redirect(config.uiEndpoint + "/pricing");
      }

      // Create a new Stripe session with checkout datas
      const session = await stripeClient.checkout.sessions.create({
        customer: result.subscription.stripeId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        mode: "subscription",
        success_url:
          config.apiEndpoint + "/api/stripe/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: config.uiEndpoint + "/pricing",
      });

      // Redirect the user the the checkout screen
      res.redirect(303, session.url || config.uiEndpoint + "/pricing");
    } catch (err) {
      return res.status(500).json({ stringSession: stringSession, err });
    }
  },
};
