import { detect } from "chardet";
import { decode } from "iconv-lite";

export const decodeBase64 = (base64string: string): Uint8Array => {
  return Uint8Array.from(window.atob(base64string), (s) => s.charCodeAt(0));
};

export const decodeToString = (binary: Uint8Array): { text: string; encoding: string } => {
  const encoding = detect(binary) ?? "utf-8";
  const text = decode(Buffer.from(binary), encoding);
  return { text, encoding };
};
