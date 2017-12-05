<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import SideBarBase from "./SideBarBase.vue";

export default tsx.component({
    name: "SideBarBranches",
    render(): VNode {
        return (
            <SideBarBase title="Branches & Tags">
                Not implemented
            </SideBarBase>
        );
    }
});
</script>
