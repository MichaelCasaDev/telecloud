import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import * as Icon from "react-feather";

export default function Component({ position }: any) {
  let [showModalSite, setModalSite] = useState("error");

  return (
    <div className="navbar">
      <Head>
        <link rel="stylesheet" href="/style/navbar.css" />
      </Head>

      <Link href="/">
        <a>
          <img src="/img/logo.svg" alt="Telecloud Logo expanded" />
        </a>
      </Link>

      <Icon.Menu
        size={16}
        className="menu"
        onClick={() => setModalSite("yes")}
      />

      <div
        id="links"
        className={
          showModalSite == "yes"
            ? "active"
            : showModalSite == "no"
            ? "disactive"
            : `no`
        }
      >
        <button className="close" onClick={() => setModalSite("no")}>
          <Icon.X size={16} />
        </button>
        <p>
          <Link href="/cloud">
            <a className={position == "cloud" ? "selected" : ""}>
              <Icon.Cloud
                size={16}
                style={{
                  marginRight: "0.5rem",
                  marginBottom: "-2px",
                }}
              />
              Cloud
            </a>
          </Link>
        </p>
        <p>
          <Link href="/shares">
            <a className={position == "shares" ? "selected" : ""}>
              <Icon.Share2
                size={16}
                style={{
                  marginRight: "0.5rem",
                  marginBottom: "-2px",
                }}
              />
              Shares
            </a>
          </Link>
        </p>
        <p>
          <Link href="/settings">
            <a className={position == "settings" ? "selected" : ""}>
              <Icon.Settings
                size={16}
                style={{
                  marginRight: "0.5rem",
                  marginBottom: "-2px",
                }}
              />
              Settings
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
