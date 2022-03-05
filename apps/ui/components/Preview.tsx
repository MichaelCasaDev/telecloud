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

  const baseType =
    Object.keys(selectedFilePreview).length != 0
      ? selectedFilePreview.type.split("/")[0]
      : "";

  const fileSrc =
    showPreview == "yes"
      ? `${config.apiEndpoint}/api/file/get/${encodeURI(
          selectedFilePreview.name
        )}?stringSession=${btoa(
          cookies[config.cookies.stringSession.name]
        )}&uuid=${selectedFilePreview.uuid}&download=false`
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
            {selectedFilePreview.name}
          </p>
        </p>
        <p
          onClick={(e) => {
            setPos({
              x: e.screenX - 180,
              y: e.screenY,
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
            {!config.notToPreview.includes(selectedFilePreview.type) ? (
              <>
                {baseType == "image" ? (
                  <img src={fileSrc} />
                ) : baseType == "video" ? (
                  <video src={fileSrc} controls controlsList="nodownload" />
                ) : baseType == "audio" ? (
                  <audio controls>
                    <source src={fileSrc} />
                  </audio>
                ) : (
                  <object
                    data={fileSrc}
                    type={
                      selectedFilePreview.type.split("/")[0] == "text"
                        ? "text/plain"
                        : selectedFilePreview.type
                    }
                    width={"90%"}
                    height={"90%"}
                    style={{
                      backgroundColor: "white",
                      color: "black",
                    }}
                  />
                )}{" "}
              </>
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
        <p>Last Edit: {formatDate(selectedFilePreview.lastEdit || "")}</p>
        <p>
          <span
            style={{
              marginRight: "1rem",
            }}
          >
            Parts: {selectedFilePreview.parts}
          </span>
          Size: {formatSizeUnits(selectedFilePreview.size)}
        </p>
      </div>
    </div>
  );
}
