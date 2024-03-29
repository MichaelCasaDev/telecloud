import { useState } from "react";
import Head from "next/head";
import { useEffect } from "react";

export default function Modal_CreateFolder({
  show,
  files,
  onClose,
  onEditHandler,
}: any) {
  const [name, setName] = useState(files.length > 0 ? files[0].name : "");

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

    onEditHandler({
      newName: name,
    }).then(() => {
      setName("");
    });
  }

  useEffect(() => {
    if (show == "yes") setName(files[0].name);
  }, [show]);

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
        <p className="boxTitle">Rename</p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <input
              type="text"
              placeholder="New Name"
              value={name}
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
              Close
            </button>
            <button type="submit" className="submitChange">
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
