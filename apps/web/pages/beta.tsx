import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import * as Icon from "react-feather";
import * as config from "../config";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const router = useRouter();

  async function listPhoneHandler(e: any) {
    e.preventDefault();

    const toastId = toast.loading("Listing account", {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
    });

    const res = await fetch(config.apiEndpoint + "/api/beta/listnumber", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: String(phoneNumber),
      }),
    });

    const json = await res.json();

    if (!json.err) {
      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        render: "Account listed!",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        isLoading: false,
      });

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    } else {
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        render: json.err,
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        isLoading: false,
      });
    }
  }

  async function loadData() {}

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
        <link rel="stylesheet" href="/style/beta.css" />
      </Head>

      <Navbar />

      <div className="container">
        <div className="box">
          <p id="title">
            Enter your phone number to list your Telegram account in Telecloud
            beta program
          </p>

          <form>
            <input
              type="phone"
              placeholder="Phone number"
              name="phonenumber"
              autoComplete="tel"
              value={phoneNumber}
              required
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button onClick={listPhoneHandler}>
              <Icon.Key
                size={16}
                style={{
                  marginRight: "0.5rem",
                  marginBottom: "-2px",
                }}
              />{" "}
              Join beta
            </button>
          </form>

          <p id="bottomText">
            *After you list your account you need to wait to be accepted in
            Telecloud beta program. Times may vary based on how much users join
            the beta program.
            <br />
            *The listed phone number cannot be changed! Beta program is strictly
            related to the phone number of your Telegram account.
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (!config.isBeta) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  } else {
    return { props: {} };
  }
}
