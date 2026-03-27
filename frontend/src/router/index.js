import { createRouter, createWebHashHistory } from "vue-router";
import Home              from "../pages/Home.vue";
import CustomerList      from "../pages/CustomerSelect.vue";
import ItemList          from "../pages/ItemList.vue";
import QuotationList     from "../pages/QuotationList.vue";
import NewQuoteCustomer  from "../pages/NewQuoteCustomer.vue";
import NewQuoteItems     from "../pages/NewQuoteItems.vue";
import NewQuoteReview    from "../pages/NewQuoteReview.vue";

const routes = [
  { path: "/",                    component: Home },
  { path: "/customers",           component: CustomerList },
  { path: "/items",               component: ItemList },
  { path: "/quotations",          component: QuotationList },
  { path: "/new-quote/customer",  component: NewQuoteCustomer },
  { path: "/new-quote/items",     component: NewQuoteItems },
  { path: "/new-quote/review",    component: NewQuoteReview },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
