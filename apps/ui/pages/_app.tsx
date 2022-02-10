import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: any) {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  let theme = window.localStorage.getItem("theme") == "dark";

  // Check for theme changes every 1000 ms
  setInterval(() => {
    theme = window.localStorage.getItem("theme") == "dark";
  }, 1000);

  return (
    <ThemeProvider
      defaultTheme="light"
      storageKey="theme"
      disableTransitionOnChange
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        limit={3}
        theme={theme ? "dark" : "light"}
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
