import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import * as config from "../config";
import { toast } from "react-toastify";

export default function Page() {
  const [cookies, setCookie] = useCookies();

  const router = useRouter();

  async function logout() {
    const stringSession = cookies[config.cookies.stringSession.name] || "";

    if (stringSession != "") {
      const toastId = toast.loading("Logging out...", {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });

      const res = await fetch(config.apiEndpoint + "/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stringSession: stringSession,
        }),
      });

      if (!res.ok) {
        toast.update(toastId, {
          type: toast.TYPE.ERROR,
          render: "Cannot logout, try again later...",
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          isLoading: false,
        });

        setTimeout(() => {
          router.replace("/settings");
        }, 1000);
      } else {
        toast.update(toastId, {
          type: toast.TYPE.SUCCESS,
          render: "Logged out!",
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          isLoading: false,
        });

        setTimeout(() => {
          router.replace("/login");
        }, 1000);
      }
    } else {
      router.replace("/login");
    }

    // Delete user stringSession
    setCookie(config.cookies.stringSession.name, "", {
      maxAge: 0,
    });

    // Reset all saved data in user localStorage
    window.localStorage.removeItem("files");
    window.localStorage.removeItem("me");
    window.localStorage.removeItem("pic");
    window.localStorage.removeItem("settings");
    window.localStorage.removeItem("totFiles");
    window.localStorage.removeItem("totFolders");
    window.localStorage.removeItem("totSpace");
    window.localStorage.setItem("theme", "light");
  }

  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    logout();
  }, []);
  if (!mounted) return null;

  return (
    <div>
      <Head>
        <title>Telecloud</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="stylesheet" href="/style/auth.css" />
      </Head>

      <div id="container">
        <img src="/img/logo.svg" alt="Telecloud" />
      </div>
    </div>
  );
}
