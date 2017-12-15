<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VIconButton from "./VIconButton.vue";

// @vue/component
export default tsx.componentFactoryOf<{ onClick: null }>().create({
    name: "VCloseButton",
    functional: true,
    props: {
        disabled: p(Boolean).default(false)
    },
    render(_h, { data }): VNode {
        return (
            <VIconButton class="close-button" {...data}>
                close
            </VIconButton>
        );
    }
});
</script>

<style lang="scss">
.md-icon-button.close-button {
    min-width: 32px;
    min-height: 32px;
    margin: 0;
    padding: auto;
    .md-icon {
        font-size: 20px !important;
    }
}
</style>
