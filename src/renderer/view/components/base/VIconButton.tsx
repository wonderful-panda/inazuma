import VButton from "./VButton";
import { MdIcon } from "./md";
import { PropsOf } from "vue-support";

type Props = PropsOf<typeof VButton>;

export default _fc<Props>(({ props, children, data }) => {
  const { props: _, scopedSlots, ...rest } = data;
  return (
    <VButton class="md-icon-button" {...props} {...rest}>
      <MdIcon>{children}</MdIcon>
    </VButton>
  );
});
