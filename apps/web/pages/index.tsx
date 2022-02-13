import Head from "next/head";
import { useEffect, useState } from "react";

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
        <title>Telecloud</title>
      </Head>

      <div className="container">
        <div id="header">
          <h1>Telecloud</h1>
        </div>
      </div>
    </div>
  );
}
