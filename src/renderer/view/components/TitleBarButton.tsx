import VIconButton from "./base/VIconButton";
import { withclass } from "./base/withClass";
import { css } from "emotion";

export default withclass(VIconButton)(css`
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
`);
