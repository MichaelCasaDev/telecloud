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
        Telecloud is now Open Sourced! Check it out<Link href="https://github.com/MichaelCasaDev/telecloud" target="_blank" style={{
          textDecoration: "underline",
          color: "blue"
        }}>here</Link>
      </p>
      <div className="sections">
        <div className="section">
          <Link href="/">
            <img
              className="title"
              src="/img/logo-exp.svg"
              alt="Telecloud Logo expanded"
            />
          </Link>

          <p>An unlimited cloud storage based on Telegram!</p>
          <p>
            Made by
            <Link href="https://twitter.com/MichaelCasaDev" target="_blank">
              MichaelCasaDev
            </Link>
            from 🇮🇹
          </p>
        </div>
        <div className="section">
          <p className="title">Links</p>

          <Link href="/faq">
            FAQ
          </Link>
          <Link href="/pricing">
            Pricing
          </Link>
          <Link href="/statistics">
            Statistics
          </Link>
        </div>
        <div className="section">
          <p className="title">Socials</p>

          <Link href="https://twitter.com/MichaelCasaDev" target="_blank">
            MichaelCasaDev (Creator)
          </Link>
        </div>
      </div>
      <div className="divider"></div>
      <p>Copyright © 2022 Telecloud. All rights reserved.</p>
    </div>
  );
}
