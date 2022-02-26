import Head from "next/head";
import Navbar from "../components/Navbar";
import Account from "../components/Account";
import { checkAuth } from "../lib/checkAuth";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useTheme } from "next-themes";
import * as config from "../config";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useCookies();

  const { theme, setTheme } = useTheme();
  const [me, setMe] = useState(
    JSON.parse(window.localStorage.getItem("me") || "{}")
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
        <title>Telecloud | Chats</title>
        <link rel="stylesheet" href="/style/chats.css" />
      </Head>

      <Navbar position="shares" />

      <div className="container">
        <div id="header">
          <h1>Chats</h1>
          <Account />
        </div>

        <div id="sharesBox"></div>
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
