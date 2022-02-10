import { useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";

export default function Modal_CreateFile({
  show,
  onClose,
  onFileCreateHandler,
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

    const toastId = toast.loading("Uploading file(s) ...", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
    });

    onFileCreateHandler(file, toastId);
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
        <p className="boxTitle">Upload a file</p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <input
              type="file"
              placeholder="Files"
              required={true}
              multiple={true}
              onChange={(e: any) => setFile(e.target.files)}
            />
          </div>
          <div className="buttons">
            <button
              type="reset"
              className="cancelChange"
              onClick={handleCloseClick}
            >
              Cancel
            </button>
            <button type="submit" className="submitChange">
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
