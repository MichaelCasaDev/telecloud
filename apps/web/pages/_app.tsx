import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "../styles/globals.css";
import "../styles/navbar.css";
import "../styles/footer.css";

function MyApp({ Component, pageProps }: any) {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <ThemeProvider
      defaultTheme="system"
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
        theme={"light"}
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
