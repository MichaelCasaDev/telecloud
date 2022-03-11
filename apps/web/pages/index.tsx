import Head from "next/head";
import Navbar from "../components/Navbar";
import * as Icon from "react-feather";
import Link from "next/link";
import * as config from "../config";
import Footer from "../components/Footer";

export default function Page() {  
  return (
    <div>
      <Head>
        <title>Telecloud</title>
        <link rel="stylesheet" href="/style/index.css" />
      </Head>

      <Navbar />

      <div className="container">
        <div id="header">
          <p className="title">Telecloud</p>
          <p className="subtitle">
            An <span className="alt">UNLIMITED</span> cloud storage based on
            Telegram!
          </p>
          {config.isBeta ? (
            <Link href={"/beta"}>
              <a className="try">
                Join beta now{" "}
                <Icon.ArrowRight
                  size={16}
                  style={{
                    marginLeft: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              </a>
            </Link>
          ) : (
            <Link href={config.uiEndpoint + "/login"}>
              <a className="try">
                Register now{" "}
                <Icon.ArrowRight
                  size={16}
                  style={{
                    marginLeft: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              </a>
            </Link>
          )}
        </div>

        <div id="features">
          <div className="feature">
            <Icon.Shield size={48} />
            <p className="title">Secure</p>
            <p className="description">
              All files are stored only on your Telegram account. Telecloud
              would never have access to them!
            </p>
          </div>
          <div className="feature">
            <Icon.Tag size={48} />
            <p className="title">Free</p>
            <p className="description">
              You can start using Telecloud just for free and upload how many
              files you want!
            </p>
          </div>
          <div className="feature">
            <Icon.Cloud size={48} />
            <p className="title">Unlimited</p>
            <p className="description">
              You can upload how much files you want from Megabytes to Terabytes
              of datas!
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
