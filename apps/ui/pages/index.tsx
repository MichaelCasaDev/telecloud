import Head from "next/head";
import Navbar from "../components/Navbar";
import Account from "../components/Account";
import { GetServerSidePropsContext } from "next";
import { checkAuth } from "../lib/checkAuth";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useTheme } from "next-themes";
import * as config from "../config";
import { formatSizeUnits } from "../lib/utils";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useCookies();

  const { theme, setTheme } = useTheme();
  const [me, setMe] = useState(
    JSON.parse(window.localStorage.getItem("me") || "{}")
  );

  const [percUsage, setPercUsage] = useState(
    Number(window.localStorage.getItem("percUsage")) || 0
  );

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
    window.localStorage.setItem("me", JSON.stringify(json1.data));

    const subPlan = json1.data.subscription.plan;
    const bandwidthUsage = json1.data.bandwidth.monthlyUsage[0];

    switch (subPlan) {
      case "starter": {
        const percUsageX = Math.round((bandwidthUsage / 50000000000) * 100);

        setPercUsage(percUsageX);
        window.localStorage.setItem("percUsage", String(percUsageX));
        break;
      }
      case "premium": {
        const percUsageX = Math.round((bandwidthUsage / 200000000000) * 100);

        setPercUsage(percUsageX);
        window.localStorage.setItem("percUsage", String(percUsageX));
        break;
      }
      case "unlimited": {
        const percUsageX = -1;

        setPercUsage(percUsageX);
        window.localStorage.setItem("percUsage", String(percUsageX));
        break;
      }
    }
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
        <title>Telecloud</title>
        <link rel="stylesheet" href="/style/index.css" />
      </Head>

      <Navbar position="home" />

      <div className="container">
        <div id="header">
          <div>
            <p id="username">Welcome back {me.username}</p>
            <p id="name">{me.name}</p>
          </div>
          <Account />
        </div>

        <div
          style={{
            marginTop: "12rem",
          }}
        >
          <p>Used bandwidth this month</p>
          <p id="bandwidthBox">
            <p id="bar">
              <p
                id="perc"
                style={{
                  width: (percUsage == -1 ? "100" : percUsage) + "%",
                }}
              />
            </p>
            <p>
              {percUsage == -1 ? "Unlimited" : percUsage + "%"}
              {percUsage == -1 ? "" : " - "}
              {percUsage == -1 ? (
                <></>
              ) : (
                formatSizeUnits(me.bandwidth.monthlyUsage[0])
              )}
            </p>
          </p>
        </div>
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
