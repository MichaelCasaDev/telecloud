import Head from "next/head";
import Navbar from "../components/Navbar";
import Account from "../components/Account";
import Link from "next/link";
import * as Icon from "react-feather";
import { GetServerSidePropsContext } from "next";
import { checkAuth } from "../lib/checkAuth";
import { useRouter } from "next/dist/client/router";
import Modal_DeleteAccount from "../components/modals/DeleteAccount";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useTheme } from "next-themes";
import * as config from "../config";
import { toast } from "react-toastify";
import Modal_EditFileDestination from "../components/modals/EditFileDestination";

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);

  const [show, setShow] = useState("error");
  const [showEdit, setShowEdit] = useState("error");

  const [me, setMe] = useState(
    JSON.parse(window.localStorage.getItem("me") || "{}")
  );

  const [cookies, setCookie] = useCookies();
  const router = useRouter();

  async function loadData() {
    const res = await fetch("http://localhost:8000/api/user/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    const json = await res.json();

    setMe(json.data);
    window.localStorage.setItem("me", JSON.stringify(json.data));
    setLoaded(true);
  }

  async function deleteAllUserDatas() {
    const res = await fetch("http://localhost:8000/api/user/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    if (res.status == 200) {
      toast.success("Account succesfully deleated!!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });

      // Delete user stringSession from cookeis
      setCookie(config.cookies.stringSession.name, "", {
        maxAge: 0,
      });

      // Delete all saved data in localStorage
      window.localStorage.removeItem("files");
      window.localStorage.removeItem("me");
      window.localStorage.removeItem("pic");
      window.localStorage.removeItem("totFiles");
      window.localStorage.removeItem("totFolders");
      window.localStorage.removeItem("totSpace");
      window.localStorage.setItem("theme", "system");

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    }
  }

  async function updateUserDatas(datas?: any) {
    const toastId = toast.loading(
      datas ? "Applying changes" : "Checking for updates",
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,

        draggable: true,
        progress: undefined,
      }
    );

    await fetch("http://localhost:8000/api/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
        data: datas || {},
      }),
    });

    await loadData();

    toast.update(toastId, {
      type: toast.TYPE.SUCCESS,
      render: datas ? "Changes applied!" : "Updated!",
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
      isLoading: false,
      theme: datas ? (!datas["darkMode"] ? "dark" : "light") : undefined,
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loaded && me.settings.theme != null) {
      setTheme(me.settings.theme);
    }
  }, [me]);

  if (!loaded) return null;

  return (
    <div>
      <Head>
        <title>Telecloud | Settings</title>
        <link rel="stylesheet" href="/style/settings.css" />
      </Head>

      <Navbar position="settings" />

      <Modal_DeleteAccount
        show={show}
        onClose={() => setShow("no")}
        onAccountDeleteHandler={deleteAllUserDatas}
      />

      <Modal_EditFileDestination
        show={showEdit}
        currentChat={me.settings.fileDestination}
        onClose={() => setShowEdit("no")}
        onEditHandler={updateUserDatas}
      />

      <div className="container">
        <div id="header">
          <h1>Settings</h1>
          <Account />
        </div>

        <div id="settingsBox">
          <div className="item">
            <span>Theme</span>
            <p id="themeSwitch">
              <p
                className={me.settings.theme == "light" ? "selected" : ""}
                onClick={() =>
                  updateUserDatas({
                    theme: "light",
                  })
                }
              >
                Light
              </p>
              <p
                className={me.settings.theme == "system" ? "selected" : ""}
                onClick={() =>
                  updateUserDatas({
                    theme: "system",
                  })
                }
              >
                System
              </p>
              <p
                className={me.settings.theme == "dark" ? "selected" : ""}
                onClick={() =>
                  updateUserDatas({
                    theme: "dark",
                  })
                }
              >
                Dark
              </p>
            </p>
          </div>
          <div className="item">
            <span>
              File's destination{" "}
              <span
                style={{
                  fontStyle: "italic",
                }}
              >
                ({me.settings.fileDestination.name})
              </span>
            </span>
            <p>
              <p
                className="button"
                onClick={() => {
                  setShowEdit("yes");
                }}
              >
                <Icon.ChevronsUp
                  size={16}
                  style={{
                    marginBottom: "-2px",
                    marginRight: "10px",
                  }}
                />
                Change
              </p>
            </p>
          </div>
          <div className="item">
            <span>File preview</span>
            <p>
              <label className="switch">
                <input
                  id="checkbox1"
                  type="checkbox"
                  onChange={(e) =>
                    updateUserDatas({
                      filePreview: e.target.checked,
                    })
                  }
                  checked={me.settings.filePreview}
                />
                <span className="slider round"></span>
              </label>
            </p>
          </div>
          <div className="item">
            <span>
              Change subscription{" "}
              <span
                style={{
                  fontStyle: "italic",
                }}
              >
                ({me.subscription.plan})
              </span>
            </span>
            <p
              className="button"
              onClick={() => {
                router.replace("/pricing");
              }}
            >
              <Icon.CreditCard
                size={16}
                style={{
                  marginBottom: "-2px",
                  marginRight: "10px",
                }}
              />
              Pricing
            </p>
          </div>
          <div className="item">
            <span>Check for updates</span>
            <p className="button" onClick={() => updateUserDatas()}>
              <Icon.RefreshCw
                size={16}
                style={{
                  marginBottom: "-2px",
                  marginRight: "10px",
                }}
              />
              Check
            </p>
          </div>
          <div className="item">
            <span>Delete account</span>
            <p className="button red" onClick={() => setShow("yes")}>
              <Icon.Delete
                size={16}
                style={{
                  marginBottom: "-2px",
                  marginRight: "10px",
                }}
              />
              Delete
            </p>
          </div>

          <p className="divider" />

          <div className="center">
            <p className="button logout">
              <Link href="/logout">
                <a>
                  <Icon.LogOut
                    size={16}
                    style={{
                      marginBottom: "-2px",
                      marginRight: "10px",
                    }}
                  />
                  Logout
                </a>
              </Link>
            </p>
          </div>
          <div className="center">
            <p>
              <Link href="/">
                <a>
                  <Icon.ArrowLeft
                    size={16}
                    style={{
                      marginBottom: "-2px",
                      marginRight: "10px",
                    }}
                  />
                  Back to Dashboard
                </a>
              </Link>
            </p>
          </div>
          <div className="center version">{config.version}</div>
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
