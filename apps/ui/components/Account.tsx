import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import * as config from "../config";

export default function Component() {
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useCookies();

  const [img, setImg] = useState(window.localStorage.getItem("pic") || "");

  async function loadData() {
    // User pic
    const res = await fetch("http://localhost:8000/api/user/pic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    const json = await res.json();

    if (!json.err) {
      setImg(`data:image/png;base64,${json.data}`);

      window.localStorage.setItem("pic", `data:image/png;base64,${json.data}`);
    }
  }

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);
  if (!mounted) return null;

  return (
    <div id="account">
      <Head>
        <link rel="stylesheet" href="/style/account.css" />
      </Head>
      <Link href="/">
        <img src={img} alt="" />
      </Link>
    </div>
  );
}
