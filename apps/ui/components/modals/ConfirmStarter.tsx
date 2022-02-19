import { useState } from "react";
import Head from "next/head";

export default function Modal_ConfirmStarter({
  show,
  data,
  onClose,
  onConfirmHandler,
}: any) {
  const [file, setFile] = useState(null);

  const handleCloseClick = (e: any) => {
    e.preventDefault();

    // Reset document inputs
    document.querySelectorAll(".inputs input").forEach((x: any) => {
      x.value = "";
    });

    onClose();
  };

  function submitHandler(e: any) {
    e.preventDefault();

    onConfirmHandler(data.plan, data.type, true);
  }

  return (
    <div
      id="modal"
      className={
        show == "yes" ? "modalShow" : show == "no" ? "modalHide" : "modalHideA"
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseClick(e);
        }
      }}
    >
      <Head>
        <link rel="stylesheet" href="/style/modal.css" />
      </Head>

      <div className="internalModal">
        <p className="boxTitle">
          Confirm your new{" "}
          <span
            style={{
              fontWeight: "bold",
            }}
          >
            Starter
          </span>{" "}
          subscription
        </p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <p>
              Your active plan will stop to exist immediately and will be
              changed to the new one!
            </p>
          </div>
          <div className="buttons">
            <button
              type="reset"
              className="cancelChange"
              onClick={handleCloseClick}
              style={{
                color: "#f65c5c",
              }}
            >
              Cancel
            </button>
            <button type="submit" className="submitChange">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
