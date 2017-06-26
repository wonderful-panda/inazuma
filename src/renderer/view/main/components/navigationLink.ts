import Vue from "vue";
import * as p from "vue-typed-component/lib/props";

export const NavigationLink = Vue.extend({
    name: "NavigationLink",
    ...<CompiledTemplate>require("./navigationLink.pug"),
    props: {
        icon: p.Str.Required,
        text: p.Str.Required
    }
});
