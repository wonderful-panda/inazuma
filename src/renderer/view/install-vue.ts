import Vue from "vue";
import Vuex from "vuex";
import VuePersist from "vue-persist";
import VueMaterial from "vue-material";
import installFilters from "view/filters";
Vue.use(Vuex);
Vue.use(VuePersist);
Vue.use(VueMaterial);
installFilters();
