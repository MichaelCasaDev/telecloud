import Stripe from "stripe";
import * as config from "../config"

export function stripeClientLogin() {
  const stripeClient = new Stripe(
    config.stripe.apiKey,
    config.stripe.configuration
  );

  return stripeClient;
}
