<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import * as typed from "vue-typed-component";
import p from "vue-strict-prop";

// @vue/component
export default tsx.componentFactoryOf<{ onInput: string | undefined }>().create({
    name: "VTextField",
    props: {
        value: p(String, Number).optional,
        label: p(String).optional,
        helperText: p(String).optional,
        disabled: p(Boolean).default(false),
        inputAttrs: p(Object).optional
    },
    computed: {
        labelNode(): VNode | undefined {
            return this.label
                ? <label>{this.label}</label>
                : undefined;
        },
        helperTextNode(): VNode | undefined {
            return this.helperText
                ? <span staticClass="md-helper-text">{this.helperText}</span>
                : undefined;
        }
    },
    methods: {
        onInput(value: string | undefined) {
            this.$emit("input", value);
        }
    },
    render(): VNode {
        return (
            <md-field>
                {this.labelNode}
                <md-input
                    value={this.value}
                    onInput={this.onInput}
                    disabled={this.disabled}
                    {...{ attrs: this.inputAttrs }}
                />
                {this.helperTextNode}
            </md-field>
        );
    }
});
</script>
