import { IconName } from "@/types/IconName";
import { formatDateTimeLong } from "@/date";
import { GitHash } from "../GitHash";
import { Icon } from "../Icon";
import { Avatar } from "./Avatar";

const AttrIcon: React.FC<{ icon: IconName }> = ({ icon }) => (
  <Icon className="mr-1 my-auto flex-none text-greytext" icon={icon} />
);

export const CommitAttributes: React.FC<{ commit: Commit; showSummary?: boolean }> = ({
  commit,
  showSummary
}) => {
  return (
    <div className="grid grid-cols-[auto_1fr]">
      {showSummary && (
        <div className="col-span-2 grid grid-cols-[auto_1fr] font-bold mb-1 text-lg">
          <AttrIcon icon="mdi:message-text" />
          <span className="ellipsis" title={commit.summary}>
            {commit.summary}
          </span>
        </div>
      )}
      <div className="w-14 h-14 mt-1">
        <Avatar mailAddress={commit.mailAddress} />
      </div>
      <div className="grid flex-1 pl-4 overflow-hidden text-base">
        <div className="grid grid-cols-[auto_1fr]">
          <AttrIcon icon="mdi:hashtag-box" />
          <GitHash hash={commit.id} full className="ellipsis" />
        </div>
        <div className="grid grid-cols-[auto_auto_auto_auto_1fr]">
          <AttrIcon icon="mdi:account" />
          <span className="mr-12 ellipsis">{commit.author}</span>
          <AttrIcon icon="mdi:clock-outline" />
          <span className="ellipsis">{formatDateTimeLong(commit.date)}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr]">
          <AttrIcon icon="mdi:email" />
          <span className="ellipsis">{commit.mailAddress}</span>
        </div>
      </div>
    </div>
  );
};
