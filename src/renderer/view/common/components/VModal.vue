<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { queryFocusableElements } from "view/common/domutils";
import VIconButton from "./VIconButton.vue";
import VCloseButton from "./VCloseButton.vue";

const m = tsx.modifiers;

// @vue/component
export default tsx.componentFactoryOf<{ onClose: null }>().create({
    name: "VModal",
    props: {
        title: p(String).required
    },
    methods: {
        cancel(): void {
            this.$emit("close", null);
        },
        onTabKeyDown(event: KeyboardEvent): void {
            const focusable = queryFocusableElements(this.$el);
            if (focusable.length === 0) {
                return;
            }
            if (event.shiftKey) {
                if (event.target === focusable[0]) {
                    focusable[focusable.length - 1].focus();
                }
            } else {
                if (event.target === focusable[focusable.length - 1]) {
                    focusable[0].focus();
                }
            }
        }
    },
    render(): VNode {
        const maskListeners = {
            click: this.cancel,
            "!keydown": m.tab(this.onTabKeyDown)
        };
        return (
            <transition name="modal">
                <div staticClass="fullscreen-overlay modal-mask" {...{ on: maskListeners }}>
                    <div staticClass="modal-container" onClick={m.stop} onKeydown={m.esc(this.cancel)}>
                        <div staticClass="modal-header">
                            <div staticClass="modal-title md-title">
                                {this.title}
                            </div>
                            <VCloseButton onClick={this.cancel} />
                        </div>
                        <div staticClass="modal-content">
                            {this.$slots.default}
                        </div>
                        <div staticClass="modal-footer">
                            <div style={{flex: 1}} />
                            {this.$slots["footer-buttons"]}
                        </div>
                    </div>
                </div>
            </transition>
        );
    }
}, ["title"]);
</script>

<style lang="scss">
    .modal-mask {
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9998;
        transition: all 0.3s ease;
        overflow: hidden;

        &.modal-enter, &.modal-leave-active {
            background-color: rgba(0, 0, 0, 0);
        }
    }

    .modal-container {
        display: flex;
        padding-left: 1em;
        flex-flow: column nowrap;
        box-sizing: border-box;
        background: var(--md-theme-default-background);
    }

    .modal-title {
        margin-top: 1em;
        margin-bottom: 0.5em;
        flex: 1;
    }

    .modal-header {
        display: flex;
        flex-flow: row nowrap;
    }

    .modal-footer {
        display: flex;
        flex-direction: row;
        padding-right: 1em;
    }

    .modal-content {
        padding-left: 0.5em;
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: auto;
    }
</style>
