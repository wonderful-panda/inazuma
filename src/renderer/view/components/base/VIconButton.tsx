import VButton from "./VButton";
import { MdIcon } from "./md";
import { ComponentProps } from "vue-tsx-support/lib/advance";

type Props = ComponentProps<typeof VButton>;

export default _fc<Props>(({ props, children, data }) => {
  const { props: _, scopedSlots, ...rest } = data;
  return (
    <VButton class="md-icon-button" {...props} {...rest}>
      <MdIcon>{children}</MdIcon>
    </VButton>
  );
});
