import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { checkAuth } from "../lib/checkAuth";
import * as config from "../config";
import * as Icon from "react-feather";
import { toast } from "react-toastify";
import QRCode from "qrcode.react";

let stopRefreshSignIn = false;

export default function Page() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const [stringSession, setStringSession] = useState("");

  const [timeout, setTimeoutX] = useState(0);
  const [qrCode, setQrCode] = useState({
    enabled: false,
    value: "",
    expires: 0,
  });

  const [step, setStep] = useState(0); // [0] phonenumber - [1] code - [2] 2FA (if needed)

  const [cookies, setCookie] = useCookies();
  const router = useRouter();

  /* ############################################################################################ */

  // Send code
  async function sendCodeHandler(e: any) {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/auth/sendCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: stringSession,

        phoneNumber: phoneNumber,
      }),
    });

    const json = await res.json();

    setStringSession(json.stringSession);
    setCookie(config.cookies.stringSession.name, json.stringSession, {
      path: config.cookies.stringSession.path,
      expires: new Date(Date.now() + config.cookies.stringSession.expire), // 1 Year
    });

    if (json.err) {
      toast.error(json.err.errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.info("Code sent!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
      setPhoneCodeHash(json.phoneCodeHash);
      setTimeoutX(Number(json.timeout));

      setStep(step + 1);
    }
  }

  // Resend code (after timeout)
  async function resendCodeHandler(e: any) {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/auth/resendCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: stringSession,

        phoneNumber: phoneNumber,
        phoneCodeHash: phoneCodeHash,
      }),
    });

    const json = await res.json();

    if (json.err) {
      toast.error(json.err.errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.info("Code re-sent!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  // Login with or without 2FA
  async function loginHandler(e: any) {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: stringSession,

        phoneNumber: phoneNumber,
        phoneCode: phoneCode,
        phoneCodeHash: phoneCodeHash,
        password: password,
      }),
    });

    const json = await res.json();

    if (json.err) {
      toast.error(json.err.errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });

      if (json.err.errorMessage == "SESSION_PASSWORD_NEEDED") {
        setStep(step + 1);
      }
    } else {
      toast.info("Logged in!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        router.replace("/");
      }, 1000);
    }
  }

  // Request a QRCode from servers
  async function qrCodeHandler() {
    const toastId = toast.loading(
      qrCode.value == "" ? "Requesting QR Code..." : "Refreshing QR Code...",
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      }
    );
    const res = await fetch("http://localhost:8000/api/auth/qrcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: stringSession,
        password: password,
      }),
    });

    toast.update(toastId, {
      type: toast.TYPE.SUCCESS,
      render: qrCode.value == "" ? "QR Code generated!" : "QR Code refreshed!",
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
      isLoading: false,
    });

    const json = await res.json();

    setQrCode({
      enabled: true,
      value: json.code,
      expires: json.expires,
    });

    stopRefreshSignIn = false;

    const nowDate = new Date(Date.now());
    const endDate = new Date(json.expires * 1000);
    const seconds = (endDate.getTime() - nowDate.getTime()) / 1000;
    setTimeoutX(Math.floor(seconds));

    setStringSession(json.stringSession);
    setCookie(config.cookies.stringSession.name, json.stringSession, {
      path: config.cookies.stringSession.path,
      expires: new Date(Date.now() + config.cookies.stringSession.expire), // 1 Year
    });

    // Try to auth every 2000ms
    const run = async () => {
      let login = await listenToLoginQrCode(json.stringSession);
      if (login != 0 && !stopRefreshSignIn) setTimeout(() => run(), 2000);
      else stopRefreshSignIn = true;
    };

    run();
  }

  // Try to verify authentication progress, check for 2FA errors
  async function listenToLoginQrCode(strSession: string) {
    try {
      const res = await fetch("http://localhost:8000/api/auth/qrcodesignin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stringSession: strSession,
          password: password,
          token: qrCode.value,
        }),
      });

      const json = await res.json();

      if (json.err && json.err.errorMessage == "SESSION_PASSWORD_NEEDED") {
        setStep(1);
        stopRefreshSignIn = true;

        toast.error("2FA authentication needed", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
        });
      } else if (json.err) {
        return -1;
      } else {
        toast.success("Logged in!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          router.replace("/");
        }, 1000);

        return 0;
      }
    } catch (err) {
      return -1;
    }
  }

  // Login with 2FA provided
  async function loginQRCodeHandler(e: any) {
    e.preventDefault();

    const toastId = toast.loading("Logging...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      progress: undefined,
    });

    const res = await fetch("http://localhost:8000/api/auth/qrcodesignin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: stringSession,
        password: password,
        token: qrCode.value,
      }),
    });

    const json = await res.json();

    if (json.err) {
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        render: "2FA password not valid!",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        isLoading: false,
      });
    } else {
      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        render: "Logged in!",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        isLoading: false,
      });

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    }
  }

  // Timer for timeout resend code button
  useEffect(() => {
    if (timeout != 0) {
      setTimeout(() => {
        setTimeoutX(timeout - 1);
      }, 1000);
    }
  }, [timeout]);

  /* ############################################################################################ */

  return (
    <div>
      <Head>
        <title>Telecloud</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="stylesheet" href="/style/auth.css" />
      </Head>

      <div id="container">
        <img src="/img/logo.svg" alt="Telecloud" />
        <div className="box">
          <p id="title">Login with Telegram</p>
          {qrCode.enabled ? (
            <>
              <div className="steps">
                <div className="step" id={step == 0 ? "selected" : ""}>
                  <p className="icon">1</p>
                  <p className="title">Scan QR Code</p>
                </div>
                {step == 1 ? (
                  <>
                    <div
                      className="divider"
                      id={step == 1 ? "selectedDiv" : ""}
                    ></div>
                    <div className="step" id={step == 1 ? "selected" : ""}>
                      <p className="icon">2</p>
                      <p className="title">2FA</p>
                    </div>
                  </>
                ) : null}
              </div>
              {step == 0 ? (
                <form>
                  <p id="qrcode">
                    <QRCode value={qrCode.value} />
                  </p>
                  <p>Scan the above QR Code with your Telegram app to login.</p>

                  {timeout != 0 ? (
                    <p id="timeout">Refresh in {timeout}s...</p>
                  ) : (
                    <p id="alt" onClick={qrCodeHandler}>
                      <Icon.ArrowLeft
                        size={16}
                        style={{
                          marginBottom: "-3px",
                        }}
                      />{" "}
                      Refresh QR Code
                    </p>
                  )}

                  <p
                    id="alt"
                    onClick={() => {
                      setQrCode({ enabled: false, value: "", expires: 0 });
                      stopRefreshSignIn = true;
                    }}
                  >
                    Or login by Phone number
                  </p>
                </form>
              ) : step == 1 ? (
                <form>
                  <input
                    type="password"
                    placeholder="2FA Password"
                    name="2fa"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={loginQRCodeHandler}>
                    <Icon.LogIn
                      size={16}
                      style={{
                        marginRight: "0.5rem",
                        marginBottom: "-2px",
                      }}
                    />{" "}
                    Login
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            <>
              <div className="steps">
                <div className="step" id={step == 0 ? "selected" : ""}>
                  <p className="icon">1</p>
                  <p className="title">Phone number</p>
                </div>
                <div
                  className="divider"
                  id={step == 1 ? "selectedDiv" : ""}
                ></div>
                <div className="step" id={step == 1 ? "selected" : ""}>
                  <p className="icon">2</p>
                  <p className="title">Code</p>
                </div>
                {step == 2 ? (
                  <>
                    <div
                      className="divider"
                      id={step == 2 ? "selectedDiv" : ""}
                    ></div>
                    <div className="step" id={step == 2 ? "selected" : ""}>
                      <p className="icon">3</p>
                      <p className="title">2FA</p>
                    </div>
                  </>
                ) : null}
              </div>
              {step == 0 ? (
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
                  <button onClick={sendCodeHandler}>
                    <Icon.Key
                      size={16}
                      style={{
                        marginRight: "0.5rem",
                        marginBottom: "-2px",
                      }}
                    />{" "}
                    Send code
                  </button>

                  <p id="alt" onClick={qrCodeHandler}>
                    Or login by QR Code
                  </p>
                </form>
              ) : step == 1 ? (
                <form>
                  <p id="sent">
                    Authentication code sent to{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {
                        // Print phone number like is "hidden"
                        phoneNumber.replace(
                          phoneNumber.substring(4, 11),
                          "*******"
                        )
                      }
                    </span>
                  </p>

                  <input
                    type="text"
                    placeholder="Code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={phoneCode}
                    required
                    onChange={(e) => setPhoneCode(e.target.value)}
                  />
                  {timeout != 0 ? (
                    <p id="timeout">Re-send in {timeout}s...</p>
                  ) : (
                    <p id="alt" onClick={resendCodeHandler}>
                      <Icon.ArrowLeft
                        size={16}
                        style={{
                          marginBottom: "-3px",
                        }}
                      />{" "}
                      Resend code
                    </p>
                  )}
                  <button onClick={loginHandler}>
                    <Icon.LogIn
                      size={16}
                      style={{
                        marginRight: "0.5rem",
                        marginBottom: "-2px",
                      }}
                    />{" "}
                    Login
                  </button>

                  <p id="alt" onClick={() => setStep(0)}>
                    Or, change phone number
                  </p>
                </form>
              ) : step == 2 ? (
                <form>
                  <input
                    type="password"
                    placeholder="2FA Password"
                    name="2fa"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={loginHandler}>
                    <Icon.LogIn
                      size={16}
                      style={{
                        marginRight: "0.5rem",
                        marginBottom: "-2px",
                      }}
                    />{" "}
                    Login
                  </button>
                </form>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const okAuth: boolean = await checkAuth(context);

  if (okAuth) {
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
