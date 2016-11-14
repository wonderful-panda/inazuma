import * as Vue from "vue";
import { component, prop } from "vueit";

@component({
    compiledTemplate: require("./drawer-link.pug")
})
export class DrawerLink extends Vue {
    @prop.required name: string;
    @prop.required icon: string;
    @prop.required text: string;
    @prop params: any;

    get location() {
        return {
            name: this.name,
            params: this.params
        };
    }
}
