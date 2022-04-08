import { useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";

export default function Modal_CreateFile({
  show,
  onClose,
  onFileCreateHandler,
}: any) {
  const [file, setFile] = useState([] as any[]);

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

    onFileCreateHandler(file, toastId).then(() => {
      setFile([]);
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
        <p className="boxTitle">Upload a file</p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <div
              id="input"
              style={{
                position: "relative",
                textAlign: "left",
              }}
            >
              Select files
              <input
                type="file"
                placeholder="Files"
                required={true}
                multiple={true}
                onChange={(e: any) =>
                  setFile(e.target.files.length != 0 ? e.target.files : file)
                }
                style={{
                  opacity: "0",
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  marginTop: "-2px",
                  cursor: "pointer",
                }}
              />
            </div>
            {file && file.length > 0 ? (
              <div>
                <div
                  style={{
                    maxHeight: "12rem",
                    overflowY: "auto",
                  }}
                >
                  {Object.keys(file).map((x: any, i: number) => {
                    return (
                      <div className="file">
                        <p key={i}>{file[x].name}</p>
                        <p
                          className="remove"
                          onClick={() => {
                            const a = Array.from(file);
                            a.splice(x, 1);

                            setFile(a);
                          }}
                        >
                          x
                        </p>
                      </div>
                    );
                  })}
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    padding: "1rem",
                  }}
                >
                  {"Total: " + file.length}
                </p>
              </div>
            ) : null}
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
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
