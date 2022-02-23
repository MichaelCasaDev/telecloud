import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalBandwidth: 0,
  });

  async function loadData() {
    const res = await fetch("http://localhost:8000/api/public/statistics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    setData(json.data);
  }

  function formatSizeUnits(bytes: any) {
    if (bytes >= 1073741824) {
      bytes = (bytes / 1073741824).toFixed(2) + " GB";
    } else if (bytes >= 1048576) {
      bytes = (bytes / 1048576).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
      bytes = (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes > 1) {
      bytes = bytes + " bytes";
    } else if (bytes == 1) {
      bytes = bytes + " byte";
    } else {
      bytes = "0 GB";
    }
    return bytes;
  }

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);
  if (!mounted) return null;

  return (
    <div>
      <Head>
        <title>Telecloud | Statistics</title>
        <link rel="stylesheet" href="/style/statistics.css" />
      </Head>

      <Navbar />

      <div className="container">
        <div id="statistics">
          <p className="title">Statistics</p>
          <div className="divider"></div>
          <div className="stats">
            <div className="stat">
              <p className="title">Total users</p>
              <p className="data">{data.totalUsers}</p>
            </div>
            <div className="stat">
              <p className="title">Total manages files</p>
              <p className="data">{data.totalFiles}</p>
            </div>
            <div className="stat">
              <p className="title">Total used bandwidth</p>
              <p className="data">{formatSizeUnits(data.totalBandwidth)}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
