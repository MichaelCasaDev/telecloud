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

  selectAll,
}: {
  file: any;
  onContextMenu: any;
  onClick: any;
  showPreview: any;
  filePreview: any;

  selectAll: any;
}) {
  const { isFolder, name, size, lastEdit, type, uuid } = file;
  const baseType = type.split("/")[0];

  const [selected, setSelected] = useState(false);

  const router = useRouter();

  useEffect(() => {
    selectAll ? setSelected(true) : setSelected(false);
  }, [selectAll]);

  return (
    <>
      <div
        className={classNames("file", selected ? "selected" : "", selected ? "useThisFile" : "")}
        id={uuid}
        onContextMenu={(e) => {
          onContextMenu(e);
        }}
        onClick={() => onClick()}
        onDragStart={(e) => {
          e.currentTarget.classList.add("useThisFile");
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove("useThisFile");
        }}
        data-isFolder={isFolder}
        data-uri={encodeURI(name)}
        data-file={JSON.stringify(file)}
        draggable={true}
      >
        <p
          id="select"
          onClick={() => (selected ? setSelected(false) : setSelected(true))}
        >
          {selected ? <Icon.XSquare size={16} /> : <Icon.Square size={16} />}
        </p>
        {isFolder ? (
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
              {baseType == "image" ? (
                <Icon.Image
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              ) : baseType == "video" ? (
                <Icon.Video
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "-2px",
                  }}
                />
              ) : baseType == "audio" ? (
                <Icon.Music
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

        <p id="size">{formatSizeUnits(size)}</p>
        <p id="date">{formatDate(lastEdit)}</p>
      </div>
    </>
  );
}
