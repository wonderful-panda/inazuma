import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(localizedFormat);

export const timezone = dayjs.tz.guess() || "America/New_York";

export function formatDateL(v: number): string {
  return dayjs(v).tz(timezone).format("L");
}

export function formatDateLLL(v: number): string {
  return dayjs(v).tz(timezone).format("LLL");
}

export function toLongDate(v: number | undefined): string {
  if (!v) {
    return "";
  }
  return dayjs(v).tz(timezone).format("L LT");
}
