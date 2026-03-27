<template>
  <div style="display:flex;flex-direction:column;height:100%;background:#f9fafb;">

    <!-- Step header -->
    <div style="background:#1e2d4f;padding:12px 16px 14px;flex-shrink:0;">
      <!-- Step indicator -->
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
        <div style="flex:1;height:3px;border-radius:2px;background:#3b5998;position:relative;">
          <div style="position:absolute;inset:0;background:#60a5fa;border-radius:2px;"></div>
        </div>
        <div style="flex:1;height:3px;border-radius:2px;background:#3b5998;"></div>
        <div style="flex:1;height:3px;border-radius:2px;background:#3b5998;"></div>
      </div>
      <p style="margin:0 0 2px;font-size:11px;color:#93c5fd;">Step 1 of 3</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:white;">Select Customer</p>
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
               type="search" placeholder="Search customers…"
               style="width:100%;box-sizing:border-box;padding:9px 12px 9px 32px;
                      border:1px solid #e5e7eb;border-radius:8px;font-size:14px;
                      background:#f9fafb;outline:none;color:#111827;"
               autocomplete="off" />
      </div>
    </div>

    <!-- List -->
    <div style="flex:1;overflow-y:auto;">
      <!-- Loading skeleton -->
      <div v-if="loading && customers.length === 0">
        <div v-for="n in 8" :key="n"
             style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #f3f4f6;">
          <div style="width:40px;height:40px;border-radius:50%;background:#e5e7eb;flex-shrink:0;margin-right:12px;"></div>
          <div style="flex:1;">
            <div style="height:13px;background:#e5e7eb;border-radius:4px;margin-bottom:6px;width:60%;"></div>
            <div style="height:11px;background:#f3f4f6;border-radius:4px;width:40%;"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && customers.length === 0"
           style="text-align:center;padding:48px 24px;color:#9ca3af;">
        <svg width="40" height="40" fill="none" stroke="#d1d5db" viewBox="0 0 24 24"
             style="margin:0 auto 12px;display:block;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m4-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/>
        </svg>
        <p style="margin:0;font-size:14px;">No customers found</p>
      </div>

      <!-- Customer rows -->
      <ul v-else style="list-style:none;margin:0;padding:0;">
        <li v-for="c in customers" :key="c.name"
            @click="selectCustomer(c)"
            style="display:flex;align-items:center;padding:12px 16px;
                   border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.15s;"
            :style="selected?.name === c.name
                    ? 'background:#eff6ff;'
                    : 'background:white;'">
          <!-- Avatar -->
          <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;
                      justify-content:center;font-size:14px;font-weight:600;flex-shrink:0;margin-right:12px;"
               :style="selected?.name === c.name
                       ? 'background:#1e2d4f;color:white;'
                       : 'background:#e0e7ff;color:#4f46e5;'">
            <svg v-if="selected?.name === c.name" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else>{{ initials(c.customer_name) }}</span>
          </div>
          <!-- Info -->
          <div style="flex:1;min-width:0;">
            <p style="margin:0;font-size:14px;font-weight:500;color:#111827;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              {{ c.customer_name }}
            </p>
            <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">
              {{ c.customer_group || c.territory || c.name }}
            </p>
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
      <div v-if="loading && customers.length > 0"
           style="display:flex;justify-content:center;padding:12px;">
        <div style="width:20px;height:20px;border:2px solid #1e2d4f;border-top-color:transparent;
                    border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      </div>
    </div>

    <!-- Continue bar -->
    <transition name="slide-bar">
      <div v-if="selected"
           style="background:white;border-top:1px solid #e5e7eb;padding:12px 16px;
                  padding-bottom:calc(12px + env(safe-area-inset-bottom));flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    margin-bottom:10px;">
          <div>
            <p style="margin:0;font-size:12px;color:#6b7280;">Selected customer</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">{{ selected.customer_name }}</p>
          </div>
          <button @click="selected = null"
                  style="border:none;background:none;cursor:pointer;color:#9ca3af;font-size:20px;
                         line-height:1;padding:4px;">×</button>
        </div>
        <button @click="proceed"
                style="width:100%;padding:13px;background:#1e2d4f;color:white;border:none;
                       border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;
                       display:flex;align-items:center;justify-content:center;gap:8px;">
          Continue to Items
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
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

const customers = ref([]);
const loading   = ref(false);
const hasMore   = ref(true);
const search    = ref("");
const selected  = ref(store.state.customer || null);
const page      = ref(0);
const PAGE_SIZE = 20;

let searchTimer = null;

async function loadCustomers(reset = false) {
  if (reset) { page.value = 0; customers.value = []; hasMore.value = true; }
  loading.value = true;
  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.get_customers",
      args: { search: search.value, page: page.value, page_size: PAGE_SIZE },
    });
    const rows = res?.message || [];
    customers.value.push(...rows);
    hasMore.value = rows.length === PAGE_SIZE;
  } catch { /* silent */ }
  finally { loading.value = false; }
}

function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadCustomers(true), 300);
}

function loadMore() {
  page.value++;
  loadCustomers();
}

function selectCustomer(c) {
  selected.value = selected.value?.name === c.name ? null : c;
}

function proceed() {
  if (!selected.value) return;
  store.setCustomer(selected.value);
  router.push("/new-quote/items");
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
}

onMounted(() => loadCustomers());
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.slide-bar-enter-active { transition: transform 0.2s ease, opacity 0.2s; }
.slide-bar-leave-active { transition: transform 0.15s ease, opacity 0.15s; }
.slide-bar-enter-from, .slide-bar-leave-to { transform: translateY(100%); opacity: 0; }
</style>
