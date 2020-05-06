import VIconButton from "./base/VIconButton";
import { withClass } from "./base/withClass";
import { css } from "emotion";

const titleBarIconStyle = css`
  min-height: 28px;
  max-height: 28px;
  min-width: 28px;
  max-width: 28px;
  .md-icon {
    font-size: 22px !important;
    color: #888 !important;
    &:hover {
      color: #fff !important;
    }
  }
`;

export default withClass(VIconButton, titleBarIconStyle);
