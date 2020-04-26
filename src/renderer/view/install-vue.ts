import Vue from "vue";
import Vuex from "vuex";
import VueCompositionApi from "@vue/composition-api";
import VueMaterial from "vue-material";
import installFilters from "view/filters";
Vue.use(Vuex);
Vue.use(VueCompositionApi);
Vue.use(VueMaterial);
installFilters();
