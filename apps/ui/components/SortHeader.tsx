import { useCookies } from "react-cookie";
import * as Icon from "react-feather";
import * as config from "../config";

export default function Component({
  sortType,
  setSortType,

  sortOrder,
  setSortOrder,

  selectAll,
  setSelectAll,
}: any) {
  const [cookies, setCookies] = useCookies();

  const dataTheme = document.querySelector("html")?.getAttribute("data-theme");
  function saveSort(sortOrderX: any, sortTypeX: any) {
    setCookies(config.cookies.sortOrder.name, sortOrderX, {
      path: config.cookies.sortOrder.path,
      expires: new Date(Date.now() + config.cookies.sortOrder.expire), // 1 Year
    });

    setCookies(config.cookies.sortType.name, sortTypeX, {
      path: config.cookies.sortType.path,
      expires: new Date(Date.now() + config.cookies.sortType.expire), // 1 Year
    });
  }

  return (
    <div id="names">
      <p
        id="select"
        onClick={() => (selectAll ? setSelectAll(false) : setSelectAll(true))}
      >
        {selectAll ? <Icon.XSquare size={16} /> : <Icon.Square size={16} />}
      </p>
      <p
        className="sort"
        onClick={() => {
          setSortType("name");
          sortOrder === ">" ? setSortOrder("<") : setSortOrder(">");

          saveSort(sortOrder === ">" ? "<" : ">", "name");
        }}
      >
        Name
        <div className="iconSort">
          <Icon.ChevronUp
            size={16}
            color={
              sortType == "name" && sortOrder == ">"
                ? dataTheme == "dark"
                  ? "white"
                  : "black"
                : "gray"
            }
          />
          <Icon.ChevronDown
            size={16}
            color={
              sortType == "name" && sortOrder == "<"
                ? dataTheme == "dark"
                  ? "white"
                  : "black"
                : "gray"
            }
          />
        </div>
      </p>
      <p
        className="sort"
        onClick={() => {
          setSortType("size");
          sortOrder === ">" ? setSortOrder("<") : setSortOrder(">");

          saveSort(sortOrder === ">" ? "<" : ">", "size");
        }}
      >
        Size
        <div className="iconSort">
          <Icon.ChevronUp
            size={16}
            color={
              sortType == "size" && sortOrder == ">"
                ? dataTheme == "dark"
                  ? "white"
                  : "black"
                : "gray"
            }
          />
          <Icon.ChevronDown
            size={16}
            color={
              sortType == "size" && sortOrder == "<"
                ? dataTheme == "dark"
                  ? "white"
                  : "black"
                : "gray"
            }
          />
        </div>
      </p>
      <p
        className="sort"
        onClick={() => {
          setSortType("lastEdit");
          sortOrder === ">" ? setSortOrder("<") : setSortOrder(">");

          saveSort(sortOrder === ">" ? "<" : ">", "lastEdit");
        }}
      >
        Last edit
        <div className="iconSort">
          <Icon.ChevronUp
            size={16}
            color={
              sortType == "lastEdit" && sortOrder == ">"
                ? dataTheme == "dark"
                  ? "white"
                  : "black"
                : "gray"
            }
          />
          <Icon.ChevronDown
            size={16}
            color={
              sortType == "lastEdit" && sortOrder == "<"
                ? dataTheme == "dark"
                  ? "white"
                  : "black"
                : "gray"
            }
          />
        </div>
      </p>
    </div>
  );
}
