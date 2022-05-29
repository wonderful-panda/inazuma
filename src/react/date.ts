import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(localizedFormat);

export const timezone = dayjs.tz.guess() || "America/New_York";

export function formatDate(v: number | bigint): string {
  return dayjs(typeof v === "number" ? v : Number(v))
    .tz(timezone)
    .format("L");
}

export function formatDateTime(v: number | bigint): string {
  return dayjs(typeof v === "number" ? v : Number(v))
    .tz(timezone)
    .format("L LT");
}

export function formatDateTimeLong(v: number | bigint): string {
  return dayjs(typeof v === "number" ? v : Number(v))
    .tz(timezone)
    .format("lll");
}
