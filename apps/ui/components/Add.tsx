import { useState } from "react";
import * as Icon from "react-feather";

export default function Component({
  setModalFolder,
  setModalFile,
}: {
  setModalFolder: any;
  setModalFile: any;
}) {
  const [show, setShow] = useState("error");

  return (
    <>
      <div
        id="add"
        onClick={() => (show == "yes" ? setShow("no") : setShow("yes"))}
      >
        <p id="item">+</p>

        <form
          id="options"
          className={
            show == "yes" ? "addShow" : show == "no" ? "addHide" : "addHideA"
          }
        >
          <label onClick={() => setModalFolder("yes")}>
            <Icon.FolderPlus
              size={16}
              style={{
                marginRight: "0.5rem",
                marginBottom: "-2px",
              }}
            />
            Folder
          </label>
          <label onClick={() => setModalFile("yes")}>
            <Icon.FilePlus
              size={16}
              style={{
                marginRight: "0.5rem",
                marginBottom: "-2px",
              }}
            />
            Upload
          </label>
        </form>
      </div>
    </>
  );
}
