import { convertFileSrc } from "@tauri-apps/api/core";
import { useMemo } from "react";

export const Avatar: React.FC<{ mailAddress: string }> = ({ mailAddress }) => {
  const src = useMemo(() => convertFileSrc(encodeURI(mailAddress), "avatar"), [mailAddress]);
  return <img src={src} className="h-full" />;
};
