import Head from "next/head";
import Navbar from "../components/Navbar";
import Account from "../components/Account";
import { GetServerSidePropsContext } from "next";
import { checkAuth } from "../lib/checkAuth";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useTheme } from "next-themes";
import * as config from "../config";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useCookies();

  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(
    JSON.parse(window.localStorage.getItem("settings") || "{}")
  );

  async function loadData() {
    const res1 = await fetch("http://localhost:8000/api/user/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    const json1 = await res1.json();

    setSettings(json1.data.settings);
  }

  useEffect(() => {
    if (settings.darkMode != null && settings.filePreview != null) {
      setTheme(settings.darkMode ? "dark" : "light");
    }
  }, [settings]);

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
      </Head>

      <Navbar position="" />

      <div className="container">
        <div id="header">
          <h1>Telecloud</h1>
          <Account />
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
