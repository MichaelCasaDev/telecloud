import Link from "next/link";
import { useState } from "react";
import * as Icon from "react-feather";
import * as config from "../config";

export default function Navbar() {
  let [showModalSite, setModalSite] = useState("error");

  return (
    <div className="navbar">
      <Link href="/">
        <a>
          <img src="/img/logo-exp.svg" alt="Telecloud Logo expanded" />
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
          <Icon.X size={24} />
        </button>

        <p>
          <Link href="/">
            <a>Home</a>
          </Link>
        </p>
        <p>
          <Link href="/faq">
            <a>FAQ</a>
          </Link>
        </p>
        <p>
          <Link href="/pricing">
            <a>Pricing</a>
          </Link>
        </p>
        <p>
          <Link href="/statistics">
            <a>Statistics</a>
          </Link>
        </p>
        <p id="dashboard">
          <Link href={config.uiEndpoint + "/"}>
            <a className={"selected"} target="_blank">
              <Icon.ArrowRightCircle
                size={16}
                style={{
                  marginRight: "0.5rem",
                }}
              />
              Dashboard
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
