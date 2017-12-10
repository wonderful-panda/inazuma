<script lang="tsx">
import Vue, { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { componentWithStore } from "../store";
import p from "vue-strict-prop";
import VDialogBase from "view/common/components/VDialogBase.vue";
import VIconButton from "view/common/components/VIconButton.vue";

interface MainLayoutProps {
    title: string;
}

export default componentWithStore({
    name: "BaseLayout",
    props: {
        title: p(String).required
    },
    data() {
        return { menuVisible: false };
    },
    methods: {
        toggleMenu(): void {
            this.menuVisible = !this.menuVisible;
        }
    },
    render(): VNode {
        return (
            <div staticClass="main-container">
                <md-app md-mode="fixed">
                    <md-app-toolbar staticClass="md-primary" md-dense>
                        <VIconButton mini onClick={this.toggleMenu}>
                            menu
                        </VIconButton>
                        <span staticClass="main-title md-title" style={{margin: 0, flex: 1}}>
                            {this.title}
                        </span>
                        <div staticClass="md-toolbar-section-end">
                            {this.$slots["titlebar-buttons"]}
                        </div>
                    </md-app-toolbar>

                    <md-app-drawer md-active={this.menuVisible} md-fixed>
                        <md-toolbar staticClass="md-transparent" md-elevation={0}>
                            <div staticClass="md-toolbar-section-end">
                                <VIconButton mini onClick={this.toggleMenu}>
                                    keyboard_arrow_left
                                </VIconButton>
                            </div>
                        </md-toolbar>
                        <md-list {...{ on: { "!click": this.toggleMenu } }}>
                            {this.$slots["drawer-navigations"]}
                        </md-list>
                    </md-app-drawer>

                    <md-app-content style={{position: "relative", padding: "1px"}}>
                        <div staticClass="main-content">
                            {this.$slots["default"]}
                        </div>
                    </md-app-content>
                </md-app>

                <router-view />
                <VDialogBase state={this.$store.state.dialog} actions={this.$store.actions.dialog} />
            </div>
        );
    }
});
</script>

<style>
.md-app {
    flex: 1;
}

.md-app-toolbar {
    padding: 0 4px;
}

.main-container {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
}

.main-content {
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    box-sizing: border-box;
    padding: 4px;
}

.main-title {
    margin: 0;
}
</style>
