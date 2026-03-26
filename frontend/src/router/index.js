import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../pages/Home.vue";
import CustomerList from "../pages/CustomerSelect.vue";
import ItemList from "../pages/ItemList.vue";
import QuotationList from "../pages/QuotationList.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/customers", component: CustomerList },
  { path: "/items", component: ItemList },
  { path: "/quotations", component: QuotationList },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
