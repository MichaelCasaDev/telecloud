import { useEffect, useState } from "react";
import Head from "next/head";
import * as Icon from "react-feather";
import { useCookies } from "react-cookie";
import * as config from "../../config";

export default function Modal_EditFileDestination({
  show,
  currentChat,
  onClose,
  onEditHandler,
}: any) {
  const [name, setName] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [selected, setSelected] = useState(currentChat);
  const [chats, setChats] = useState([]);
  const [cookies, setCookie] = useCookies();

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

    onClose();

    onEditHandler({
      fileDestination: selected,
    });
  }

  async function loadDialogs() {
    const res0 = await fetch("http://localhost:8000/api/user/dialogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    const json0 = await res0.json();

    setChats(json0.data);
  }

  useEffect(() => {
    if (show == "yes") {
      loadDialogs();
    }
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
        <p className="boxTitle">File's destination</p>
        <form onSubmit={submitHandler}>
          <div className="inputs">
            <p id="fileDestination">
              <p className="chat">
                <p className="icon">
                  <img src={`data:image/png;base64,${selected.img}`} />
                </p>
                <p className="name">{selected.name}</p>
                <p
                  className="showMore"
                  onClick={() => setShowDestinations(!showDestinations)}
                >
                  <Icon.ArrowDown
                    size={16}
                    style={{
                      marginBottom: "-2px",
                      marginRight: "10px",
                    }}
                  />
                </p>
              </p>
              {showDestinations ? (
                chats.length == 0 ? (
                  <p className="chat">
                    <p className="name">Loading chats...</p>
                  </p>
                ) : (
                  <p className="chatList">
                    {chats.map((el: any, i: number) => {
                      if (el.name != " ")
                        return (
                          <p
                            className="chat"
                            key={i}
                            onClick={() => {
                              setSelected(el);
                              setShowDestinations(false);
                            }}
                          >
                            <p className="icon">
                              <img src={`data:image/png;base64,${el.img}`} />
                            </p>
                            <p className="name">{el.name}</p>
                          </p>
                        );
                    })}
                  </p>
                )
              ) : null}
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
            <button type="submit" className="submitChange">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
