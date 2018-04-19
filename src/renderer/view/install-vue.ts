import Vue from "vue";
import * as sinai from "sinai";
import VueRouter from "vue-router";
import VueMaterial from "vue-material";
import installFilters from "view/filters";
Vue.use(sinai.install);
Vue.use(VueRouter);
Vue.use(VueMaterial);
installFilters();
