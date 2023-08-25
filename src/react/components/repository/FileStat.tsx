import classNames from "classnames";
import React from "react";

const conflictTypes: Record<string, string> = {
  UU: "both modified",
  AA: "both added",
  DD: "both deleted",
  AU: "added by us",
  UA: "added by them",
  DU: "deleted by us",
  UD: "deleted by them"
};

export const FileStat: React.FC<{ file: FileEntry; className?: string }> = ({
  file,
  className
}) => {
  return (
    <div className={classNames("flex-row-nowrap items-center font-mono", className)}>
      <span className="font-bold text-greytext mr-1 uppercase">
        {file.kind?.type === "unmerged"
          ? `conflict (${conflictTypes[file.kind.conflict_type]})`
          : file.delta?.type || "unknown"}
      </span>
      {file.delta?.type === "text" && (
        <>
          <span className="mr-1 text-[lightgreen]">+{file.delta.insertions}</span>
          <span className="mr-1 text-[hotpink]">-{file.delta.deletions}</span>
        </>
      )}
    </div>
  );
};
