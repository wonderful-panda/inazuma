import { AvatarShape } from "@backend/AvatarShape";
import { convertFileSrc } from "@tauri-apps/api/core";
import classNames from "classnames";
import { useMemo } from "react";

export const Avatar: React.FC<{
  mailAddress: string;
  shape: AvatarShape;
  fromGravatar: boolean;
}> = ({ mailAddress, shape, fromGravatar }) => {
  const src = useMemo(
    () => convertFileSrc(fromGravatar ? encodeURI(mailAddress) : "__DEFAULT__", "avatar"),
    [mailAddress, fromGravatar]
  );
  return <img src={src} className={classNames("h-full", shape == "circle" && "rounded-full")} />;
};
