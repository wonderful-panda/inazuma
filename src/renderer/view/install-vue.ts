import Vue from "vue";
import Vuex from "vuex";
import VueMaterial from "vue-material";
import installFilters from "view/filters";
Vue.use(Vuex);
Vue.use(VueMaterial);
installFilters();
