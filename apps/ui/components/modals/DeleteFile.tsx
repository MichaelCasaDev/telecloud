import Head from "next/head";

export default function Modal_DeleteFile({
  show,
  files,
  onClose,
  onFileDeleteHandler,
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

    onFileDeleteHandler();
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
        <p className="boxTitle">Delete {files.length == 1 ? files[0].name : files.length + " elements"}</p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <p>
              This will completely delete files or folders.{" "}
              <b>This can&apos;t be undone!</b>
            </p>
          </div>
          <div className="buttons">
            <button
              type="reset"
              className="cancelChange"
              onClick={handleCloseClick}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submitChange"
              style={{
                color: "#ff3333",
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
