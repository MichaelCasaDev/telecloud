import Head from "next/head";

export default function Modal_DeleteAccount({
  show,
  onClose,
  onAccountDeleteHandler,
}: any) {
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

    onAccountDeleteHandler();
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
          You are trying to{" "}
          <span
            style={{
              color: "red",
              fontWeight: "600",
            }}
          >
            DELETE
          </span>{" "}
          your account!!
        </p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <p>
              This will completely delete all files and folders saved on
              Telecloud. Your active subscription will be deleted.{" "}
              <p>
                <b>This can&apos;t be undone!</b>
              </p>
            </p>
          </div>
          <div className="buttons">
            <button
              type="reset"
              className="cancelChange"
              onClick={handleCloseClick}
            >
              Close
            </button>
            <button
              type="submit"
              className="submitChange"
              style={{
                color: "#ff3333",
                backgroundColor: "rgba(255, 51, 51, 0.2)",
              }}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
