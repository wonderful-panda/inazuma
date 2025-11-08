import { useMemo } from "react";
import { type FileStatus, FileStatusList, isValidFileStatus } from "@/filestatus";
import { FileStatusIcon } from "./FileStatusIcon";

export const NumStat: React.FC<{ files: readonly FileEntry[] }> = ({ files }) => {
  const nums = useMemo(() => {
    const ret = {} as Record<FileStatus, number>;
    for (const file of files) {
      const status = file.statusCode.substring(0, 1);
      if (isValidFileStatus(status)) {
        ret[status] = (ret[status] ?? 0) + 1;
      }
    }
    return ret;
  }, [files]);
  return (
    <div className="flex-row-wrap items-center py-1">
      {FileStatusList.filter((c) => c in nums).map((c) => [
        <FileStatusIcon key={c} statusCode={c} />,
        <div key={`${c}-num`} className="pl-1 pr-2 mt-auto">
          {nums[c]}
        </div>
      ])}
    </div>
  );
};
