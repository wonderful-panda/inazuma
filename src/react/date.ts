import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(localizedFormat);

export const timezone = dayjs.tz.guess() || "America/New_York";

export function formatDate(v: number): string {
  return dayjs(v).tz(timezone).format("L");
}

export function formatDateTime(v: number): string {
  return dayjs(v).tz(timezone).format("L LT");
}

export function formatDateTimeLong(v: number): string {
  return dayjs(v).tz(timezone).format("lll");
}
