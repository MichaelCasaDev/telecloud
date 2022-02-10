import Head from "next/head";
import Navbar from "../components/Navbar";
import Account from "../components/Account";
import File from "../components/File";
import Add from "../components/Add";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/dist/client/router";
import { asyncForEach } from "../lib/utils";
import { sortFiles } from "../lib/sortFiles";
import SortHeader from "../components/SortHeader";
import * as config from "../config";
import EditName from "../components/modals/EditName";
import DeleteFile from "../components/modals/DeleteFile";
import axios from "axios";
import SettingsBox from "../components/SettingsBox";
import Preview from "./Preview";
import FileSaver from "file-saver";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import Modal_CreateFolder from "./modals/CreateFolder";
import Modal_CreateFile from "./modals/CreateFile";
import Selecto from "react-selecto";

let fileToMove: any[] = [];

export default function Component({ routeNavigator }: { routeNavigator: any }) {
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useCookies();

  const [preview, setPreview] = useState(false);
  const { theme, setTheme } = useTheme();
  const [me, setMe] = useState(
    JSON.parse(window.localStorage.getItem("me") || "{}")
  );

  const [show, setShow] = useState("error");
  const [showRename, setShowRename] = useState("error");
  const [showDelete, setShowDelete] = useState("error");
  const [modalFolder, setModalFolder] = useState("error");
  const [modalFile, setModalFile] = useState("error");

  const [selectAll, setSelectAll] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([] as any);
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
    file: false,
    path: "/",
  });

  const [selectedFilePreview, setSelectedFilePreview] = useState({} as any);
  const [showPreview, setShowPreview] = useState("error");

  const [files, setFiles] = useState(
    window.localStorage.getItem("files")
      ? JSON.parse(window.localStorage.getItem("files") || "{}")
      : []
  );

  const [sortType, setSortType] = useState(cookies["sortType"] || "name");
  const [sortOrder, setSortOrder] = useState(cookies["sortOrder"] || "<");

  const router = useRouter();
  // Current path
  const path = router.asPath.replace("/cloud", "").startsWith("/")
    ? router.asPath.replace("/cloud", "")
    : "/" + router.asPath.replace("/cloud", "");

  /* ######################### */
  // Context menu functions
  /* ######################### */
  async function deleteFile() {
    const toastId = toast.loading("Deleting some files/folders.", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
    });

    await asyncForEach(selectedFiles, async (el: any, i: number) => {
      setShow("no");
      setShowDelete("no");
      setShowPreview("no");

      await axios
        .request({
          url: "http://localhost:8000/api/file/delete",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            uuid: el.uuid,
            stringSession: cookies[config.cookies.stringSession.name],
            path:
              router.asPath.replace("/cloud", "") == ""
                ? "/"
                : router.asPath.replace("/cloud", ""),
          },
        })
        .catch((result) => {})
        .then((result: any) => {
          if (result.status != 200) {
            toast.update(toastId, {
              type: toast.TYPE.ERROR,
              render:
                "Error while deleting a " +
                (el.isFolder ? "folder" : "file") +
                "",
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,

              draggable: true,
              progress: undefined,
              isLoading: false,
            });
          }
        });
    });

    toast.update(toastId, {
      type: toast.TYPE.SUCCESS,
      render: "Files/Folders successfully deleted!",
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
      isLoading: false,
    });

    loadData();
  }
  async function editFile({ newName }: { newName: string }) {
    const el = selectedFiles[0];
    setShow("no");
    setShowRename("no");
    setShowPreview("no");

    const toastId = toast.loading(
      "Renaming a " + (el.isFolder ? "folder" : "file") + ".",
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,

        draggable: true,
        progress: undefined,
      }
    );

    await axios
      .request({
        url: "http://localhost:8000/api/file/edit",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          uuid: el.uuid,
          stringSession: cookies[config.cookies.stringSession.name],
          name: newName,
          lastEdit: new Date(Date.now()).getTime(),
          path:
            router.asPath.replace("/cloud", "") == ""
              ? "/"
              : router.asPath.replace("/cloud", ""),
        },
      })
      .catch((result) => {})
      .then((result: any) => {
        if (result.status == 200) {
          toast.update(toastId, {
            type: toast.TYPE.SUCCESS,
            render: "File renamed successfully!",
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,

            draggable: true,
            progress: undefined,
            isLoading: false,
          });
        } else {
          toast.update(toastId, {
            type: toast.TYPE.ERROR,
            render:
              "A " +
              (el.isFolder ? "folder" : "file") +
              " with this name already exists!",
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,

            draggable: true,
            progress: undefined,
            isLoading: false,
          });
        }

        loadData();
      });
  }
  async function downloadFile(disable: boolean, fileX?: any[]) {
    let x = selectedFiles;

    if (fileX != null) {
      x = fileX;
    }

    const toastId = toast.loading("Downloading a file...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
    });

    await asyncForEach(x, async (el: any, i: number) => {
      disable ? setShow("no") : null;

      await axios
        .request({
          url: `http://localhost:8000/api/file/get/${encodeURI(
            el.name
          )}?stringSession=${btoa(
            cookies[config.cookies.stringSession.name]
          )}&uuid=${el.uuid}&download=true`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        })
        .then((result) => {
          if (result.status == 200) {
            FileSaver.saveAs(
              new Blob([result.data]),
              result.headers["file-name"]
            );
          } else {
            toast.update(toastId, {
              type: toast.TYPE.ERROR,
              render:
                "Error while downloading a " +
                (el.isFolder ? "folder" : "file") +
                "",
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,

              draggable: true,
              progress: undefined,
              isLoading: false,
            });
          }
        });
    });

    toast.update(toastId, {
      type: toast.TYPE.SUCCESS,
      render: "File downloaded successfully!",
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
      isLoading: false,
    });
  }
  async function moveFile(operation: string, fileX?: any[]) {
    let x = selectedFiles;

    if (fileX != null) {
      x = fileX;
    }

    toast.success("Files " + (operation == "copy" ? "copied" : "cutted"), {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
      isLoading: false,
    });

    // Empty the array before moving files
    fileToMove = [];

    await asyncForEach(x, async (el: any, i: number) => {
      fileToMove.push({
        operation: operation,
        file: el,
        path: path,
      });

      setCookies(config.cookies.pasteFile.name, true, {
        path: config.cookies.pasteFile.path,
      });
    });
  }
  async function pasteFile(newPath: string) {
    let toastId: string | number = "";

    if (fileToMove.length != 0) {
      toastId = toast.loading("Moving files...", {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,

        draggable: true,
        progress: undefined,
        isLoading: true,
      });
    }

    await asyncForEach(fileToMove, async (el: any, i: number) => {
      await fetch("http://localhost:8000/api/file/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stringSession: cookies[config.cookies.stringSession.name],
          uuid: el.file.uuid,
          path: el.path,
          newPath: newPath,
          operation: el.operation,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          toast.update(toastId, {
            render: "Some error occured while moving files",
            type: toast.TYPE.ERROR,
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,

            draggable: true,
            progress: undefined,
            isLoading: false,
          });
        }
      });

      setCookies(config.cookies.pasteFile.name, false, {
        path: config.cookies.pasteFile.path,
      });
    });

    toast.update(toastId, {
      render: "Files moved!",
      type: toast.TYPE.SUCCESS,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
      isLoading: false,
    });

    loadData();
  }

  /* ######################### */
  // Create files and send to APIs
  /* ######################### */
  async function onFileCreateHandler(filesX: any, toastId: string | number) {
    modalFile == "yes" ? setModalFile("no") : null;

    if (filesX instanceof FileList) {
      for (let i = 0; i < filesX.length; i++) {
        await sendData({
          lastEdit: new Date(Date.now()).getTime(),
          file: filesX.item(i),
          isFolder: false,
          toastId: toastId,
        });
      }
    } else {
      await sendData({
        lastEdit: new Date(Date.now()).getTime(),
        file: filesX,
        isFolder: false,
        toastId: toastId,
      });
    }

    // Reset document inputs
    document.querySelectorAll(".inputs input").forEach((x: any) => {
      x.value = "";
    });
  }

  async function onFolderCreateHandler({ name }: { name: string }) {
    const toastId = toast.loading("Creating a folder...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,

      draggable: true,
      progress: undefined,
    });

    modalFolder == "yes" ? setModalFolder("no") : null;

    await sendData({
      lastEdit: new Date(Date.now()).getTime(),
      file: [],
      isFolder: true,
      toastId: toastId,
      name: name,
    });
  }

  async function sendData(data: any) {
    let formData = new FormData();

    formData.append("file", data.file);
    formData.append("name", data.name);
    formData.append("isFolder", data.isFolder);
    formData.append("lastEdit", data.lastEdit);
    formData.append(
      "stringSession",
      cookies[config.cookies.stringSession.name]
    );
    formData.append("path", path);

    try {
      await axios
        .post("http://localhost:8000/api/file/upload", formData)
        .then(() => {
          if (data.isFolder) {
            toast.update(data.toastId, {
              type: toast.TYPE.SUCCESS,
              render: "Folder created!",
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,

              draggable: true,
              progress: undefined,
              isLoading: false,
            });
          } else {
            toast.update(data.toastId, {
              type: toast.TYPE.SUCCESS,
              render: "File(s) uploaded!",
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,

              draggable: true,
              progress: undefined,
              isLoading: false,
            });
          }
        });
    } catch (err: any) {
      toast.update(data.toastId, {
        type: toast.TYPE.ERROR,
        render: "Some error occured during the upload",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,

        draggable: true,
        progress: undefined,
        isLoading: false,
      });
    }

    loadData();
  }

  /* ######################### */
  // Load data from APIs
  /* ######################### */
  async function loadData() {
    setSelectAll(false);

    // User files (based on path)
    const res = await fetch("http://localhost:8000/api/user/files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
        path: path,
      }),
    });

    const json = await res.json();

    if (!json.exist) {
      toast.error("This folder doesn't exist!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,

        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        let newUrl = "";
        const urlArr = router.asPath.split("/");
        urlArr.pop();
        newUrl = urlArr.join("/");

        router.replace(newUrl);
      }, 1000);
    }

    setFiles(json.data);
    window.localStorage.setItem("files", JSON.stringify(json.data));

    const res1 = await fetch("http://localhost:8000/api/user/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stringSession: cookies[config.cookies.stringSession.name],
      }),
    });

    const json1 = await res1.json();

    setMe(json1.data);
    window.localStorage.setItem("me", JSON.stringify(json1.data));
  }

  useEffect(() => {
    if (me) {
      setTheme(me.settings.darkMode ? "dark" : "light");
      setPreview(me.settings.filePreview);
    }
  }, [me]);

  useEffect(() => {
    mounted ? loadData() : null;
  }, [router.asPath]);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);
  if (!mounted) return null;

  return (
    <div>
      <Head>
        <title>Telecloud | Cloud</title>
        <link rel="stylesheet" href="/style/cloud.css" />
      </Head>

      <Navbar position="cloud" />

      <EditName
        show={showRename}
        files={selectedFiles}
        onClose={() => setShowRename("no")}
        onEditHandler={editFile}
      />

      <Modal_CreateFolder
        show={modalFolder}
        onClose={() => {
          setModalFolder("no");
        }}
        onFolderCreateHandler={onFolderCreateHandler}
      />

      <Modal_CreateFile
        show={modalFile}
        onClose={() => {
          setModalFile("no");
        }}
        onFileCreateHandler={onFileCreateHandler}
      />

      <DeleteFile
        show={showDelete}
        files={selectedFiles}
        onClose={() => setShowDelete("no")}
        onFileDeleteHandler={deleteFile}
      />

      <SettingsBox
        pos={pos}
        downloadFile={downloadFile}
        show={show}
        setShowRename={setShowRename}
        setShow={setShow}
        setShowDelete={setShowDelete}
        paste={cookies[config.cookies.pasteFile.name] == "true" || false}
        moveFile={moveFile}
        pasteFile={pasteFile}
        createFolder={setModalFolder}
        createFile={setModalFile}
      />

      <Preview
        showPreview={showPreview}
        selectedFilePreview={selectedFilePreview}
        setPos={setPos}
        setShow={setShow}
        show={show}
        setShowPreview={setShowPreview}
        preview={preview}
        downloadFile={downloadFile}
      />

      <Selecto
        dragContainer={".container"}
        selectableTargets={[".file"]}
        hitRate={10}
        selectByClick={false}
        selectFromInside={false}
        ratio={0}
        onSelect={(e) => {
          e.added.forEach((el) => {
            el.classList.add("selected", "useThisFile");
          });
          e.removed.forEach((el) => {
            el.classList.remove("selected", "useThisFile");
          });
        }}
        onSelectEnd={(e) => {
          if (e.selected.length > 0) {
            const filex: any = [];

            e.selected.map((el) => {
              filex.push(JSON.parse(el.dataset.file || "{}"));
            });

            setSelectedFiles(filex);
          }
        }}
      />

      <div className="container">
        <div id="header">
          <p
            style={{
              width: "100%",
            }}
          >
            <h1>Cloud</h1>
            {routeNavigator}

            <SortHeader
              sortType={sortType}
              setSortType={setSortType}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              selectAll={selectAll}
              setSelectAll={setSelectAll}
            />
          </p>
          <Account />
        </div>

        <Add setModalFolder={setModalFolder} setModalFile={setModalFile} />

        <div
          id="filesBox"
          onClick={() => {
            show == "yes" ? setShow("no") : null;
          }}
          onContextMenu={(e: any) => {
            e.preventDefault();

            setPos({
              x:
                e.screenX + 160 < document.body.offsetWidth
                  ? e.screenX
                  : e.screenX - 160,
              y: e.screenY,
              file: false,
              path: path,
            });

            show == "yes" ? null : setShow("yes");
          }}
          onDragOver={(e) => {
            // Prevent default browser action for file drop/drag
            e.preventDefault();
          }}
          onDrop={async (e) => {
            // Prevent default browser action for file drop/drag
            e.preventDefault();

            // Upload files with drag-and-drop
            if (e.dataTransfer.files.length > 0) {
              const toastId = toast.loading("Uploading file(s) ...", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,

                draggable: true,
                progress: undefined,
              });

              await asyncForEach(
                e.dataTransfer.files as unknown as any[],
                async (el: any, i: number) => {
                  onFileCreateHandler(el, toastId);
                }
              );

              return;
            }

            // Move files with drag-and-drop
            if (
              (e.target as any).dataset.isfolder == "true" // Move to a folder
            ) {
              // Get files dragged and selected
              const arr: any[] = [];
              const el = document.getElementsByClassName("file useThisFile");

              for (let i = 0; i < el.length; i++) {
                arr.push(JSON.parse((el.item(i) as any).dataset.file || "{}"));
              }

              // Generate the path to the folder
              const newPath =
                path != "/"
                  ? path + "/" + (e.target as any).dataset.uri
                  : path + (e.target as any).dataset.uri;

              moveFile("cut", arr);
              pasteFile(newPath);
            }
          }}
        >
          {files && files.length > 0 ? (
            files
              .map((file: any, i: number) => {
                return (
                  <File
                    file={file}
                    selectAll={selectAll}
                    key={"route_" + i}
                    onClick={() => {
                      show == "yes" ? setShow("no") : null;
                    }}
                    onContextMenu={(e: MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();

                      setSelectedFiles([file]);
                      setPos({
                        x:
                          e.screenX + 160 < document.body.offsetWidth
                            ? e.screenX
                            : e.screenX - 160,
                        y: e.screenY,
                        file: file,
                        path: file.isFolder
                          ? path + encodeURI(file.name)
                          : path,
                      });

                      // Get files selected
                      const arr = [];
                      const el =
                        document.getElementsByClassName("file useThisFile");

                      for (let i = 0; i < el.length; i++) {
                        arr.push(
                          JSON.parse((el.item(i) as any).dataset.file || "{}")
                        );
                      }

                      arr.length != 0 ? setSelectedFiles(arr) : null;

                      show == "yes" ? null : setShow("yes");
                    }}
                    showPreview={setShowPreview}
                    filePreview={setSelectedFilePreview}
                  />
                );
              })
              .sort((a: any, b: any) => {
                return sortFiles(a, b, sortType, sortOrder);
              })
          ) : (
            <p
              style={{
                textAlign: "center",
              }}
            >
              Nothing here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
