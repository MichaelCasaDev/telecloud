import * as config from "../config";
import * as Icon from "react-feather";
import { useCookies } from "react-cookie";
import { formatDate, formatSizeUnits } from "../lib/utils";
import Link from "next/link";

export default function Componenet({
  showPreview,
  selectedFilePreview,
  setPos,
  setShow,
  show,
  setShowPreview,
  preview,
  downloadFile,
}: {
  showPreview: any;
  selectedFilePreview: any;
  setPos: any;
  setShow: any;
  show: any;
  setShowPreview: any;
  preview: boolean;
  downloadFile: any;
}) {
  const [cookies, setCookies] = useCookies();

  const { type, name, uuid, size, parts, lastEdit } = selectedFilePreview;

  const fileSrc =
    showPreview == "yes"
      ? `${config.apiEndpoint}/api/file/get/${encodeURI(
          name
        )}?stringSession=${btoa(
          cookies[config.cookies.stringSession.name]
        )}&uuid=${uuid}&download=false`
      : "";

  return (
    <div
      id="filePreview"
      className={
        showPreview == "error"
          ? "hideA"
          : showPreview == "yes"
          ? "show"
          : "hide"
      }
    >
      <div id="top">
        <p>
          <Icon.X
            size={24}
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setShow("no");
              setShowPreview("no");
            }}
          />
          <p
            style={{
              marginLeft: "1rem",
            }}
          >
            {name}
          </p>
        </p>
        <p
          onClick={(e) => {
            setPos({
              x: document.body.getBoundingClientRect().right - 230,
              y: document.body.getBoundingClientRect().top + 130,
              file: selectedFilePreview,
            });

            show == "yes" ? setShow("no") : setShow("yes");
          }}
          style={{
            cursor: "pointer",
          }}
        >
          <Icon.MoreVertical size={24} />
        </p>
      </div>

      <div id="preview">
        {preview &&
        showPreview == "yes" &&
        selectedFilePreview.size < 50000000 /* 50 Mb */ ? (
          <>
            {type == "image" ? (
              <img src={fileSrc} />
            ) : type == "video" ? (
              <video src={fileSrc} controls controlsList="nodownload" />
            ) : type == "audio" ? (
              <audio controls>
                <source src={fileSrc} />
              </audio>
            ) : type === "text" ? (
              <object
                data={fileSrc}
                type={"text/plain"}
                width={"90%"}
                height={"90%"}
                style={{
                  backgroundColor: "white",
                  color: "black",
                }}
              />
            ) : (
              <>
                <p>Preview is not supported for this file!</p>
                <p
                  onClick={() => {
                    downloadFile(false, [selectedFilePreview]);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "1rem",
                    borderRadius: "10px",
                    background: "#4F5FFF",
                  }}
                >
                  <Icon.Download
                    size={16}
                    style={{
                      marginRight: "0.5rem",
                      marginBottom: "-2px",
                    }}
                  />
                  Click here to download it!
                </p>
              </>
            )}
          </>
        ) : selectedFilePreview.size > 50000000 /* 50 Mb */ ? (
          <>
            <p>
              This file is too big to preview{" "}
              <span
                style={{
                  fontStyle: "italic",
                }}
              >
                {">"} 50 Mb
              </span>
              !
            </p>
            <p
              onClick={() => {
                downloadFile(false, [selectedFilePreview]);
              }}
              style={{
                cursor: "pointer",
                padding: "1rem",
                borderRadius: "10px",
                background: "#4F5FFF",
              }}
            >
              <Icon.Download
                size={16}
                style={{
                  marginRight: "0.5rem",
                  marginBottom: "-2px",
                }}
              />
              Click here to download it!
            </p>
          </>
        ) : (
          <>
            <p>File preview is disable from settings.</p>
            <p>
              To enable go to the{" "}
              <Link href="/settings">
                <a
                  style={{
                    color: "#5558FF",
                    fontWeight: "500",
                  }}
                >
                  settings
                </a>
              </Link>{" "}
              page
            </p>
          </>
        )}
      </div>
      <div id="bottom">
        <p>Last Edit: {formatDate(lastEdit || "")}</p>
        <p>
          <span
            style={{
              marginRight: "1rem",
            }}
          >
            Parts: {parts}
          </span>
          Size: {formatSizeUnits(size)}
        </p>
      </div>
    </div>
  );
}
