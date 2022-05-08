import classNames from "classnames";
import React from "react";

const getFileType = (item: FileEntry) => {
  if (!item.delta) {
    return "unknown";
  } else {
    return item.delta.type;
  }
};

export const FileStat: React.VFC<{ file: FileEntry; className?: string }> = ({
  file,
  className
}) => {
  return (
    <div className={classNames("flex-row-nowrap items-center font-mono", className)}>
      <span className="font-bold text-greytext mr-1 uppercase">{getFileType(file)}</span>
      {file.delta?.type === "text" && (
        <>
          <span className="mr-1 text-[lightgreen]">+{file.delta.insertions}</span>
          <span className="mr-1 text-[hotpink]">-{file.delta.deletions}</span>
        </>
      )}
    </div>
  );
};
