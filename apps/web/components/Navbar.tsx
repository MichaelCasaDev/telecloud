import Link from "next/link";
import { useState } from "react";
import * as Icon from "react-feather";
import * as config from "../config";

export default function Navbar() {
  let [showModalSite, setModalSite] = useState("error");

  return (
    <div className="navbar">
      <Link href="/">

        <img src="/img/logo-exp.svg" alt="Telecloud Logo expanded" />

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
            Home
          </Link>
        </p>
        <p>
          <Link href="/faq">
            FAQ
          </Link>
        </p>
        <p>
          <Link href="/pricing">
            Pricing
          </Link>
        </p>
        <p>
          <Link href="/statistics">
            Statistics
          </Link>
        </p>
        <p id="dashboard">
          <Link className={"selected"} target="_blank" href={config.uiEndpoint + "/"}>

            <Icon.ArrowRightCircle
              size={16}
              style={{
                marginRight: "0.5rem",
              }}
            />
            Dashboard

          </Link>
        </p>
      </div>
    </div>
  );
}
