<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { Location } from "vue-router";

// @vue/component
export default tsx.componentFactoryOf<{ onClick: null }>().create({
    name: "DrawerNavigation",
    props: {
        icon: p(String).required,
        text: p(String).required,
        to: p.ofObject<Location>().optional
    },
    render(): VNode {
        return (
            <md-list-item to={this.to} onClick={() => this.$emit("click", null)}>
                <md-icon md-dense>
                    {this.icon}
                </md-icon>
                <span staticClass="md-list-item-text md-subheading">
                    {this.text}
                </span>
            </md-list-item>
        );
    }
});
</script>
