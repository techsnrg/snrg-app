<template>
  <div style="display:flex;flex-direction:column;height:100%;background:#f9fafb;">

    <!-- Step header -->
    <div style="background:#1e2d4f;padding:12px 16px 14px;flex-shrink:0;">
      <!-- Step indicator -->
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
        <div style="flex:1;height:3px;border-radius:2px;background:#60a5fa;"></div>
        <div style="flex:1;height:3px;border-radius:2px;background:#60a5fa;position:relative;">
          <div style="position:absolute;inset:0;background:#60a5fa;border-radius:2px;"></div>
        </div>
        <div style="flex:1;height:3px;border-radius:2px;background:#3b5998;"></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <p style="margin:0 0 2px;font-size:11px;color:#93c5fd;">Step 2 of 3</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:white;">Add Items</p>
        </div>
        <!-- Customer chip -->
        <div v-if="store.state.customer"
             style="background:rgba(255,255,255,0.15);border-radius:20px;
                    padding:5px 10px;display:flex;align-items:center;gap:6px;max-width:160px;">
          <svg width="12" height="12" fill="none" stroke="#93c5fd" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
          </svg>
          <span style="font-size:12px;color:white;white-space:nowrap;overflow:hidden;
                       text-overflow:ellipsis;font-weight:500;">
            {{ store.state.customer.customer_name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search bar -->
    <div style="background:white;padding:10px 16px;border-bottom:1px solid #e5e7eb;flex-shrink:0;">
      <div style="position:relative;">
        <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);"
             width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
        <input v-model="search" @input="onSearch"
               type="search" placeholder="Search items…"
               style="width:100%;box-sizing:border-box;padding:9px 12px 9px 32px;
                      border:1px solid #e5e7eb;border-radius:8px;font-size:14px;
                      background:#f9fafb;outline:none;color:#111827;"
               autocomplete="off" />
      </div>
    </div>

    <!-- Item list -->
    <div style="flex:1;overflow-y:auto;padding-bottom:4px;">
      <!-- Loading skeleton -->
      <div v-if="loading && items.length === 0">
        <div v-for="n in 10" :key="n"
             style="display:flex;align-items:center;padding:12px 16px;
                    border-bottom:1px solid #f3f4f6;background:white;margin-bottom:1px;">
          <div style="flex:1;">
            <div style="height:13px;background:#e5e7eb;border-radius:4px;margin-bottom:6px;width:55%;"></div>
            <div style="height:11px;background:#f3f4f6;border-radius:4px;width:35%;"></div>
          </div>
          <div style="width:80px;height:32px;background:#e5e7eb;border-radius:8px;"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && items.length === 0"
           style="text-align:center;padding:48px 24px;color:#9ca3af;">
        <svg width="40" height="40" fill="none" stroke="#d1d5db" viewBox="0 0 24 24"
             style="margin:0 auto 12px;display:block;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V11"/>
        </svg>
        <p style="margin:0;font-size:14px;">No items found</p>
      </div>

      <!-- Items -->
      <ul v-else style="list-style:none;margin:0;padding:0;">
        <li v-for="item in items" :key="item.item_code"
            style="display:flex;align-items:center;padding:10px 16px;
                   border-bottom:1px solid #f3f4f6;background:white;gap:10px;">
          <!-- Item info -->
          <div style="flex:1;min-width:0;">
            <p style="margin:0;font-size:13px;font-weight:500;color:#111827;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              {{ item.item_name }}
            </p>
            <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">
              {{ item.item_code }}
              <span v-if="item.item_group"> · {{ item.item_group }}</span>
            </p>
            <!-- Price display -->
            <p style="margin:3px 0 0;font-size:12px;font-weight:600;"
               :style="prices[item.item_code] != null ? 'color:#059669' : 'color:#d1d5db'">
              {{ formatPrice(prices[item.item_code]) }}
            </p>
          </div>

          <!-- Qty controls -->
          <div style="flex-shrink:0;">
            <!-- Not in cart: add button -->
            <button v-if="!store.getCartQty(item.item_code)"
                    @click="addToCart(item)"
                    style="width:72px;padding:7px 0;background:#1e2d4f;color:white;
                           border:none;border-radius:8px;font-size:13px;font-weight:600;
                           cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              Add
            </button>
            <!-- In cart: stepper -->
            <div v-else
                 style="display:flex;align-items:center;gap:0;border:1.5px solid #1e2d4f;
                        border-radius:8px;overflow:hidden;">
              <button @click="decrement(item)"
                      style="width:28px;height:32px;border:none;background:white;
                             cursor:pointer;font-size:16px;font-weight:700;color:#1e2d4f;
                             display:flex;align-items:center;justify-content:center;">−</button>
              <span style="min-width:28px;text-align:center;font-size:13px;font-weight:700;
                           color:#1e2d4f;background:#eff6ff;height:32px;line-height:32px;">
                {{ store.getCartQty(item.item_code) }}
              </span>
              <button @click="increment(item)"
                      style="width:28px;height:32px;border:none;background:white;
                             cursor:pointer;font-size:16px;font-weight:700;color:#1e2d4f;
                             display:flex;align-items:center;justify-content:center;">+</button>
            </div>
          </div>
        </li>
      </ul>

      <!-- Load more -->
      <div v-if="hasMore && !loading" style="padding:12px;text-align:center;">
        <button @click="loadMore"
                style="font-size:13px;color:#1e2d4f;font-weight:500;border:1px solid #1e2d4f;
                       border-radius:8px;padding:8px 24px;background:white;cursor:pointer;">
          Load more
        </button>
      </div>
      <div v-if="loading && items.length > 0"
           style="display:flex;justify-content:center;padding:12px;">
        <div style="width:20px;height:20px;border:2px solid #1e2d4f;border-top-color:transparent;
                    border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      </div>
    </div>

    <!-- Cart summary bar -->
    <transition name="slide-bar">
      <div v-if="store.totalItems.value > 0"
           style="background:white;border-top:1px solid #e5e7eb;padding:12px 16px;
                  padding-bottom:calc(12px + env(safe-area-inset-bottom));flex-shrink:0;">
        <button @click="$router.push('/new-quote/review')"
                style="width:100%;padding:13px;background:#1e2d4f;color:white;border:none;
                       border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;
                       display:flex;align-items:center;justify-content:space-between;">
          <span style="display:flex;align-items:center;gap:8px;">
            <span style="background:rgba(255,255,255,0.2);border-radius:20px;
                         padding:2px 8px;font-size:12px;font-weight:700;">
              {{ store.totalItems.value }} item{{ store.totalItems.value !== 1 ? 's' : '' }}
            </span>
            Review Quote
          </span>
          <span style="display:flex;align-items:center;gap:4px;">
            {{ fmtINR(store.totalAmount.value) }}
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuoteStore } from "../composables/useQuoteStore.js";

const router  = useRouter();
const store   = useQuoteStore();

// Redirect if no customer selected
if (!store.state.customer) {
  router.replace("/new-quote/customer");
}

const items   = ref([]);
const prices  = ref({});  // { item_code: rate }
const loading = ref(false);
const hasMore = ref(true);
const search  = ref("");
const page    = ref(0);
const PAGE_SIZE = 20;

let searchTimer = null;

async function loadItems(reset = false) {
  if (reset) { page.value = 0; items.value = []; hasMore.value = true; }
  loading.value = true;
  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.get_items",
      args: { search: search.value, page: page.value, page_size: PAGE_SIZE },
    });
    const rows = res?.message || [];
    items.value.push(...rows);
    hasMore.value = rows.length === PAGE_SIZE;
    // Fetch prices for new items
    if (rows.length > 0) fetchPrices(rows.map(i => i.item_code));
  } catch { /* silent */ }
  finally { loading.value = false; }
}

async function fetchPrices(item_codes) {
  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.get_item_prices_batch",
      args: {
        item_codes: JSON.stringify(item_codes),
        customer: store.state.customer?.name || null,
      },
    });
    Object.assign(prices.value, res?.message || {});
  } catch { /* silent */ }
}

function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadItems(true), 300);
}

function loadMore() { page.value++; loadItems(); }

function addToCart(item) {
  const p = prices.value[item.item_code];
  store.setItem(item, p != null ? p.rate : 0);
}

function increment(item) {
  const qty = store.getCartQty(item.item_code);
  store.updateQty(item.item_code, qty + 1);
}

function decrement(item) {
  const qty = store.getCartQty(item.item_code);
  store.updateQty(item.item_code, qty - 1);
}

function formatPrice(priceObj) {
  if (priceObj == null) return "—";
  const rate = typeof priceObj === "object" ? priceObj.rate : priceObj;
  if (!rate && rate !== 0) return "—";
  return "₹" + Number(rate).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

onMounted(() => loadItems());
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.slide-bar-enter-active { transition: transform 0.25s ease, opacity 0.25s; }
.slide-bar-leave-active { transition: transform 0.2s ease, opacity 0.2s; }
.slide-bar-enter-from, .slide-bar-leave-to { transform: translateY(100%); opacity: 0; }
</style>
