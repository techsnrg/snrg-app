/**
 * Singleton reactive store for the New Quote wizard.
 * Shared across NewQuoteCustomer → NewQuoteItems → NewQuoteReview.
 */
import { reactive, computed } from "vue";

const state = reactive({
  customer: null,  // { name, customer_name, customer_group, territory }
  items: [],       // [{ item_code, item_name, stock_uom, qty, rate, amount }]
});

export function useQuoteStore() {
  function setCustomer(c) {
    state.customer = c;
    state.items = []; // reset cart when customer changes
  }

  function clearQuote() {
    state.customer = null;
    state.items = [];
  }

  function getCartItem(item_code) {
    return state.items.find(i => i.item_code === item_code);
  }

  function getCartQty(item_code) {
    return getCartItem(item_code)?.qty || 0;
  }

  function setItem(item, rate) {
    const existing = getCartItem(item.item_code);
    if (existing) {
      existing.qty += 1;
      existing.amount = existing.qty * existing.rate;
    } else {
      const r = rate != null ? rate : 0;
      state.items.push({
        item_code: item.item_code,
        item_name: item.item_name || item.item_code,
        item_group: item.item_group || "",
        stock_uom: item.stock_uom || "Nos",
        qty: 1,
        rate: r,
        amount: r,
      });
    }
  }

  function setItemRate(item_code, rate) {
    const item = getCartItem(item_code);
    if (item) {
      item.rate = rate;
      item.amount = item.qty * rate;
    }
  }

  function updateQty(item_code, qty) {
    if (qty <= 0) { removeItem(item_code); return; }
    const item = getCartItem(item_code);
    if (item) { item.qty = qty; item.amount = qty * item.rate; }
  }

  function removeItem(item_code) {
    const idx = state.items.findIndex(i => i.item_code === item_code);
    if (idx !== -1) state.items.splice(idx, 1);
  }

  const totalItems  = computed(() => state.items.reduce((s, i) => s + i.qty, 0));
  const totalAmount = computed(() => state.items.reduce((s, i) => s + i.amount, 0));

  return {
    state,
    setCustomer, clearQuote,
    getCartItem, getCartQty,
    setItem, setItemRate,
    updateQty, removeItem,
    totalItems, totalAmount,
  };
}
