export async function asyncForEach<T>(
  array: Array<T>,
  callback: (item: T, index: number) => Promise<void>
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index);
  }
}

export function formatSizeUnits(bytes: any) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes > 1) {
    bytes = bytes + " bytes";
  } else if (bytes == 1) {
    bytes = bytes + " byte";
  } else {
    bytes = "0 GB";
  }
  return bytes;
}

export function formatDate(date: string) {
  var lDate = new Date(Number(date));

  var month = new Array(12);
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  var hh = lDate.getHours() < 10 ? "0" + lDate.getHours() : lDate.getHours();
  var mi =
    lDate.getMinutes() < 10 ? "0" + lDate.getMinutes() : lDate.getMinutes();
  var ss =
    lDate.getSeconds() < 10 ? "0" + lDate.getSeconds() : lDate.getSeconds();

  var d = lDate.getDate();
  var dd = d < 10 ? "0" + d : d;
  var yyyy = lDate.getFullYear();
  var mon = eval(String(lDate.getMonth() + 1));
  var monthName = month[lDate.getMonth()];

  return (
    dd +
    " " +
    monthName.substring(0, 3) +
    " " +
    yyyy +
    " " +
    hh +
    ":" +
    mi +
    ":" +
    ss
  );
}
