import Head from "next/head";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import * as Icon from "react-feather";
import * as config from "../config";
import Link from "next/link";

export default function Page() {
  const [sortType, setSortType] = useState("month");

  const pricing = [
    {
      id: "starter",
      title: "Starter",
      logo: "/img/logo.svg",
      popular: false,
      description:
        "For everyone experiencing a new UNLIMITED cloud experience.",
      price: {
        month: "Free",
        year: "Free",
        yearFull: "Free",
      },
      features: [
        "Unlimited cloud storage (max 2GB per file)",
        "Upload limited bandwidth 50 GB/month",
        "Files preview and sharing",
        "Community support",
      ],
    },
    {
      id: "premium",
      title: "Premium",
      logo: "/img/logo.svg",
      popular: true,
      description: "Advanced features come in.",
      price: {
        month: "5$",
        year: "50$",
        yearFull: "60$",
      },
      features: [
        "All from Starter plan",
        "Upload limited bandwidth 200 GB/month",
        "Upload file bigger than 2 GB",
        "Premium support",
      ],
    },
    {
      id: "unlimited",
      title: "Unlimited",
      logo: "/img/logo.svg",
      popular: false,
      description: "The true power of Telecloud",
      price: {
        month: "20$",
        year: "200$",
        yearFull: "240$",
      },
      features: [
        "All from Premium plan",
        "Upload unlimited bandwidth",
        "Cloud sharing (Coming soon...)",
      ],
    },
  ];

  return (
    <div>
      <Head>
        <title>Telecloud | Pricing</title>
        <link rel="stylesheet" href="/style/pricing.css" />
      </Head>

      <Navbar />

      <div className="container">
        <div id="pricing">
          <p className="title">Pricing</p>
          <div className="divider"></div>
          <p>
            THIS PAGE IS ONLY FOR TESTING (REAL PRICES and FEATURES MAY VARY)
          </p>

          <div id="priceSwitch">
            <p id="how">How often do you want to pay?</p>
            <div>
              <p
                className={sortType == "month" ? "selected" : ""}
                onClick={() => setSortType("month")}
              >
                Monthly
              </p>
              <p
                className={sortType == "year" ? "selected" : ""}
                onClick={() => setSortType("year")}
              >
                Yearly
                <span id="yearly">
                  <Icon.Tag
                    size={14}
                    style={{
                      marginBottom: "-2px",
                      marginRight: "5px",
                      stroke:
                        "linear-gradient(-70deg, #9867f0 0%, #ed4e50 100%)",
                    }}
                  />
                  Get 2 months free
                </span>
              </p>
            </div>
          </div>
          <div id="pricingBox">
            {pricing.map((e: any, i: number) => {
              return (
                <div className="plan">
                  <div className="top">
                    <p>
                      <img src={e.logo} />
                    </p>
                    <p className="title">{e.title}</p>
                    <p className="description">{e.description}</p>
                  </div>
                  <div className="main">
                    <div className="priceBox">
                      <p className="price">
                        <p className="big">
                          {sortType == "month" ? e.price.month : e.price.year}
                        </p>
                        <p className="small">
                          {e.id != "starter"
                            ? sortType == "year"
                              ? e.price.yearFull
                              : ""
                            : ""}
                        </p>
                      </p>
                      <p className="update">
                        {e.id != "starter"
                          ? sortType == "month"
                            ? "per month"
                            : "per year"
                          : "forever"}
                      </p>
                    </div>
                    <Link href={config.uiEndpoint} className="button"
                      target="_blank"
                      style={{
                        display: "block",
                      }}>

                      Get started

                    </Link>

                    <div>
                      <div className="features">
                        {(e.features as string[]).map(
                          (x: string, i: number) => {
                            return (
                              <p className="feature">
                                <Icon.Check size={16} />
                                <p>{x}</p>
                              </p>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p id="bottomText">
            *Your card will be automatically charged when your subscription end
            if you haven't disabled it yet.
            <br />
            When upgrade or downgrade to a new subscription your active plan
            will stop working immediately and will be changed to the new one!
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
