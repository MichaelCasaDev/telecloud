import Link from "next/link";

export default function Footer() {
  return (
    <div id="footer">
      <p
        style={{
          margin: "2rem",
          fontWeight: 500,
          fontSize: "18px",
          color: "#4895ef",
        }}
      >
        Currently in{" "}
        <span
          style={{
            fontStyle: "italic",
          }}
        >
          ALPHA
        </span>
        . Some things may not work as excepted!
      </p>
      <div className="sections">
        <div className="section">
          <Link href="/">
            <a>
              <img
                className="title"
                src="/img/logo-exp.svg"
                alt="Telecloud Logo expanded"
              />
            </a>
          </Link>

          <p>An unlimited cloud storage based on Telegram!</p>
          <p>
            Made by
            <Link href="https://twitter.com/MichaelCasaDev">
              <a target="_blank">MichaelCasaDev</a>
            </Link>
            from 🇮🇹
          </p>
        </div>
        <div className="section">
          <p className="title">Links</p>

          <Link href="/faq">
            <a>FAQ</a>
          </Link>
          <Link href="/pricing">
            <a>Pricing</a>
          </Link>
          <Link href="/statistics">
            <a>Statistics</a>
          </Link>
        </div>
        <div className="section">
          <p className="title">Socials</p>

          <Link href="https://twitter.com/MichaelCasaDev">
            <a target="_blank">MichaelCasaDev (Creator)</a>
          </Link>
        </div>
      </div>
      <div className="divider"></div>
      <p>Copyright © 2022 Telecloud. All rights reserved.</p>
    </div>
  );
}
