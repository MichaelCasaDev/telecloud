import { useState } from "react";
import Head from "next/head";

export default function Modal_CreateFolder({
  show,
  onClose,
  onFolderCreateHandler,
}: any) {
  const [name, setName] = useState("");

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

    onFolderCreateHandler({
      name: name,
    });
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
        <p className="boxTitle">New Folder</p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <input
              type="text"
              placeholder="Folder Name"
              required
              onChange={(e) =>
                setName(e.target.value.length <= 32 ? e.target.value : name)
              }
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
