import Vue from "vue";
import * as sinai from "sinai";
import VueMaterial from "vue-material";
import installFilters from "view/filters";
Vue.use(sinai.install);
Vue.use(VueMaterial);
installFilters();
