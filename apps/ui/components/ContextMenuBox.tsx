import * as Icon from "react-feather";

export default function Componenet({
  pos,
  downloadFile,
  show,
  setShowRename,
  setShow,
  setShowDelete,
  paste,
  moveFile,
  pasteFile,
  createFolder,
  createFile,
}: {
  pos: any;
  downloadFile: any;
  show: string;
  setShowRename: any;
  setShow: any;
  setShowDelete: any;
  paste: boolean;
  moveFile: any;
  pasteFile: any;
  createFolder: any;
  createFile: any;
}) {
  const dataTheme = document.querySelector("html")?.getAttribute("data-theme");

  return (
    <div
      id="settingsBox"
      className={show === "yes" ? "show" : show === "no" ? "hide" : "hideA"}
      style={{
        top: pos.y - 80,
        left: pos.x,
      }}
    >
      <p
        onClick={() => {
          !pos.file ? setShow("no") : null;
          !pos.file ? createFolder("yes") : null;
        }}
        style={{
          color: !pos.file
            ? dataTheme == "dark"
              ? "white"
              : "black"
            : "#838383",
        }}
      >
        <Icon.FolderPlus
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        New Folder
      </p>
      <p
        onClick={() => {
          !pos.file ? setShow("no") : null;
          !pos.file ? createFile("yes") : null;
        }}
        style={{
          color: !pos.file
            ? dataTheme == "dark"
              ? "white"
              : "black"
            : "#838383",
        }}
      >
        <Icon.FilePlus
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Upload files
      </p>
      <p id="divider"></p>
      <p
        onClick={() => {
          paste ? setShow("no") : null;
          pasteFile(pos.path);
        }}
        style={{
          color: paste ? (dataTheme == "dark" ? "white" : "black") : "#838383",
        }}
      >
        <Icon.Clipboard
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Paste
      </p>
      <p
        onClick={() => {
          pos.file ? setShow("no") : null;
          moveFile("copy");
        }}
        style={{
          color: pos.file
            ? dataTheme == "dark"
              ? "white"
              : "black"
            : "#838383",
        }}
      >
        <Icon.Copy
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Copy
      </p>
      <p
        onClick={() => {
          pos.file ? setShow("no") : null;
          moveFile("cut");
        }}
        style={{
          color: pos.file
            ? dataTheme == "dark"
              ? "white"
              : "black"
            : "#838383",
        }}
      >
        <Icon.Scissors
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Cut
      </p>
      <p
        onClick={() => (pos.file ? downloadFile(true, [pos.file]) : null)}
        style={{
          color: pos.file
            ? dataTheme == "dark"
              ? "white"
              : "black"
            : "#838383",
        }}
      >
        <Icon.Download
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Download
      </p>
      <p
        onClick={() => {
          pos.file ? setShowRename("yes") : null;
          pos.file ? setShow("no") : null;
        }}
        style={{
          color: pos.file
            ? dataTheme == "dark"
              ? "white"
              : "black"
            : "#838383",
        }}
      >
        <Icon.Edit
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Rename
      </p>
      <p
        onClick={() => {
          pos.file ? setShowDelete("yes") : null;
          pos.file ? setShow("no") : null;
        }}
        style={{
          color: pos.file ? "red" : "#FF8080",
        }}
      >
        <Icon.Delete
          size={16}
          style={{
            marginRight: "0.5rem",
            marginBottom: "-2px",
          }}
        />
        Delete
      </p>
    </div>
  );
}
