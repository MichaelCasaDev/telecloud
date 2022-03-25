import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { formatDate, formatSizeUnits } from "../lib/utils";
import * as Icon from "react-feather";
import { useEffect, useState } from "react";
import classNames from "classnames";

export default function Component({
  file,
  onContextMenu,
  onClick,
  showPreview,
  filePreview,
}: {
  file: any;
  onContextMenu: any;
  onClick: any;
  showPreview: any;
  filePreview: any;
}) {
  const { name, size, lastEdit, type, uuid } = file;

  const [selected, setSelected] = useState(false);
  const router = useRouter();

  return (
    <>
      <div
        className={classNames("file", selected ? "selected" : "")}
        id={uuid}
        onContextMenu={(e) => {
          onContextMenu(e);
        }}
        onClick={() => onClick()}
        onDragStart={(e) => {
          e.currentTarget.classList.add("selected");
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove("selected");
        }}
        data-isFolder={type == "telecloud/folder"}
        data-uri={encodeURI(name)}
        data-file={JSON.stringify(file)}
        draggable={true}
      >
        {type == "telecloud/folder" ? (
          <Link href={router.asPath + "/" + encodeURI(name)}>
            <a id="iconName">
              <p id="icon">
                <Icon.Folder
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              </p>
              <p id="name">{name}</p>
            </a>
          </Link>
        ) : (
          <a
            id="iconName"
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              showPreview("yes");
              filePreview(file);
            }}
          >
            <p id="icon">
              {type == "image" ? (
                <Icon.Image
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              ) : type == "video" ? (
                <Icon.Film
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              ) : type == "audio" ? (
                <Icon.Speaker
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              ) : type == "text" ? (
                <Icon.FileText
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              ) : (
                <Icon.File
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              )}
            </p>
            <p id="name">{name}</p>
          </a>
        )}

        <p id="size">
          {type == "telecloud/folder" ? "-" : formatSizeUnits(size)}
        </p>
        <p id="date">{formatDate(lastEdit)}</p>
      </div>
    </>
  );
}
