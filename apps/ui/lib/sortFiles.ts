export function sortFiles(a: any, b: any, sortType: string, sortOrder: string) {
  switch (sortType) {
    case "name": {
      if (sortOrder == "<") {
        if (a.props.file.name < b.props.file.name) return 1;
        else return -1;
      } else if (sortOrder == ">") {
        if (a.props.file.name > b.props.file.name) return 1;
        else return -1;
      }
    }
    case "size": {
      if (sortOrder == "<") {
        if (Number(a.props.file.size) < Number(b.props.file.size)) return 1;
        else return -1;
      } else if (sortOrder == ">") {
        if (Number(a.props.file.size) > Number(b.props.file.size)) return 1;
        else return -1;
      }
    }
    case "lastEdit": {
      if (sortOrder == "<") {
        if (a.props.file.lastEdit < b.props.file.lastEdit)
          return 1;
        else return -1;
      } else if (sortOrder == ">") {
        if (a.props.file.lastEdit > b.props.file.lastEdit)
          return 1;
        else return -1;
      }
    }
  }

  return 0;
}