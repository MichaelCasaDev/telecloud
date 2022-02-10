import Stripe from "stripe";

export function stripeClientLogin() {
  const stripeClient = new Stripe(
    "sk_test_51K7biIDSDq7W52lUE7Zi90EGyiw2HUo8rdYXF3HHk0oriRsiFhED7c487rdC06KlIqclHelgXSnNgNyaTt3ulj6z007K2Ph0Of",
    {
      apiVersion: "2020-08-27",
    }
  );

  return stripeClient;
}

export const plans = [
  {
    "": {
      priceId: "",
      name: "",
      logo: "",
      description: "",
      price: {
        month: "",
        year: "",
      },
      features: [
        {
          name: "",
        },
      ],
    },
  },
];
