import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Page() {
  const [mounted, setMounted] = useState(false);

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
        <title>Telecloud | FAQ</title>
        <link rel="stylesheet" href="/style/faq.css" />
      </Head>

      <Navbar />

      <div className="container">
        <div id="faq">
          <div className="title">Frequenly Asked Questions</div>
          <div className="divider"></div>

          <div className="question">
            <p className="title">Q: What is Telecloud?</p>
            <p className="description">
              A: Telecloud is an unlimited cloud storage based on Telegram. You
              can upload photos, videos, documents or any type of file for free.
              We aren't the basic cloud storage like Google Drive, Mega, iCloud
              or Dropbox we offer unlimited space of storing data for free.
            </p>
          </div>
          <div className="question">
            <p className="title">Q: Who is Telecloud for?</p>
            <p className="description">
              A: Everyone who want an unlimited, secure and free cloud storage
              service. Developers, students, etc. We offer you a complitely free
              service for storing your datas.
            </p>
          </div>
          <div className="question">
            <p className="title">Q: How secure is Telecloud?</p>
            <p className="description">
              A: We would never have access to your saved files. All of your
              uploaded files to Telecloud would stay only on your Telegram
              account (on your Saved Messages by default, so anyone excepted you
              can't access it)
            </p>
          </div>
          <div className="question">
            <p className="title">Q: How it works?</p>
            <p className="description">
              A: Telecloud uses the Telegram authentication flow, so no datas
              are stored on our system. All the files you upload will be
              directly send to your Telegram account and saved ONLY there. We
              use the Telegram API to manage files and authentication.
            </p>
          </div>
          <div className="question">
            <p className="title">Q: Will Telecloud be free forever?</p>
            <p className="description">
              A: Yes, all basic features will be free for now and forever. We'll
              add some new features that can be used only with our paid
              subscriptions in future.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
