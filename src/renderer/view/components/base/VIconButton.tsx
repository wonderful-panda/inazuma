import * as tsx from "vue-tsx-support";
import VButton from "./VButton";
import { MdIcon } from "./md";
import { PropsOf } from "vue-support";

type Props = PropsOf<typeof VButton>;

const VButtonX = tsx.withPropsObject(VButton);

export default _fc<Props>(({ children, data }) => {
  return (
    <VButtonX class="md-icon-button" {...(data as any)}>
      <MdIcon>{children}</MdIcon>
    </VButtonX>
  );
});
