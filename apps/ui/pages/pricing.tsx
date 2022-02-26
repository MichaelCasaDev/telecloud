import Head from "next/head";
import Navbar from "../components/Navbar";
import Account from "../components/Account";
import { GetServerSidePropsContext } from "next";
import { checkAuth } from "../lib/checkAuth";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useTheme } from "next-themes";
import * as config from "../config";
import * as Icon from "react-feather";
import { useRouter } from "next/router";
import classNames from "classnames";
import Modal_ConfirmStarter from "../components/modals/ConfirmStarter";

export default function Page() {
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

  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useCookies();
  const [sortType, setSortType] = useState("month");
  const [show, setShow] = useState("error");
  const [data, setData] = useState({
    plan: "",
    type: "",
  });

  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [me, setMe] = useState(
    JSON.parse(window.localStorage.getItem("me") || "{}")
  );

  async function makeSubscription(
    plan: string,
    type: string,
    confirmed?: boolean
  ) {
    if (plan == "starter" && !confirmed) {
      setData({
        plan,
        type,
      });

      setShow("yes");

      return;
    }

    router.replace(
      config.apiEndpoint + "/api/stripe/create-checkout-session?plan=" +
        plan +
        "&type=" +
        type +
        "&stringSession=" +
        btoa(cookies[config.cookies.stringSession.name])
    );
  }

  async function loadData() {
    const res1 = await fetch(config.apiEndpoint + "/api/user/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    const json1 = await res1.json();

    setMe(json1.data);
  }

  useEffect(() => {
    if (Object.keys(me).length > 0) {
      setTheme(me.settings.theme);
    }
  }, [me]);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);
  if (!mounted) return null;

  return (
    <div>
      <Head>
        <title>Telecloud | Pricing</title>
        <link rel="stylesheet" href="/style/pricing.css" />
      </Head>

      <Navbar position="" />

      <Modal_ConfirmStarter
        show={show}
        data={data}
        onClose={() => setShow("no")}
        onConfirmHandler={makeSubscription}
      />

      <div className="container">
        <div id="header">
          <h1>Pricing</h1>
          <Account />
        </div>

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
                    stroke: "linear-gradient(-70deg, #9867f0 0%, #ed4e50 100%)",
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
                  <div>
                    <p
                      className={classNames(
                        "button",
                        me.subscription.plan == "starter" &&
                          me.subscription.plan == e.id
                          ? "current"
                          : me.subscription.plan == e.id &&
                            me.subscription.type == sortType
                          ? "current"
                          : ""
                      )}
                      onClick={() => {
                        me.subscription.plan == "starter" &&
                        me.subscription.plan == e.id
                          ? null
                          : me.subscription.plan == e.id &&
                            me.subscription.type == sortType
                          ? null
                          : makeSubscription(
                              e.id,
                              sortType,
                              me.subscription.plan == "starter"
                            );
                      }}
                    >
                      {me.subscription.plan == "starter" &&
                      me.subscription.plan == e.id
                        ? "Current"
                        : me.subscription.plan == e.id &&
                          me.subscription.type == sortType
                        ? "Current"
                        : "Get started"}
                    </p>
                    <div className="features">
                      {(e.features as string[]).map((x: string, i: number) => {
                        return (
                          <p className="feature">
                            <Icon.Check size={16} />
                            <p>{x}</p>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p id="bottomText">
          *Your card will be automatically charged when your subscription end if
          you haven't disabled it yet.
          <br />
          When upgrade or downgrade to a new subscription your active plan will
          stop to exist immediately and will be changed to the new one!
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const okAuth: boolean = await checkAuth(context);

  if (!okAuth) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  } else {
    return { props: {} };
  }
}
