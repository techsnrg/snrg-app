<template>
  <div class="flex flex-col h-full">

    <!-- Header: back + search on one row -->
    <div class="bg-white border-b border-gray-200 px-3 py-2 sticky top-0 z-10 flex items-center gap-2">
      <button class="text-gray-400 active:text-gray-600 shrink-0 p-1" @click="$router.push('/')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
        <input v-model="searchTerm" type="search" placeholder="Search quotations…"
               class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
               @input="onSearch" />
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-2 text-sm text-gray-500">Loading quotations…</span>
      </div>

      <div v-else-if="quotations.length === 0"
           class="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z"/>
        </svg>
        <p class="text-sm">No quotations found</p>
      </div>

      <ul v-else class="divide-y divide-gray-100">
        <li v-for="q in quotations" :key="q.name"
            class="flex items-center px-4 py-3 bg-white hover:bg-gray-50">
          <div class="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center
                      justify-center shrink-0 mr-3">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-800 truncate">{{ q.customer_name || q.customer }}</p>
              <span class="text-xs px-2 py-0.5 rounded-full ml-2 shrink-0"
                    :class="statusClass(q.status)">
                {{ q.status }}
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5 truncate">
              {{ q.name }} · {{ formatDate(q.transaction_date) }} · ₹{{ formatAmount(q.grand_total) }}
            </p>
          </div>
        </li>
      </ul>

      <div v-if="hasMore && !loading" class="py-4 flex justify-center">
        <button class="text-sm text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-green-50"
                :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? "Loading…" : "Load more" }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const PAGE_SIZE = 20;
const searchTerm = ref("");
const quotations = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const page = ref(0);
let debounceTimer = null;

async function fetchQuotations(reset = false) {
  if (reset) { page.value = 0; quotations.value = []; }
  const isFirst = page.value === 0;
  if (isFirst) loading.value = true; else loadingMore.value = true;
  try {
    const result = await frappe.call({
      method: "snrg_sales_pwa.api.sales.get_quotations",
      args: { search: searchTerm.value, page: page.value, page_size: PAGE_SIZE },
    });
    const rows = result?.message || [];
    quotations.value = isFirst ? rows : [...quotations.value, ...rows];
    hasMore.value = rows.length === PAGE_SIZE;
  } catch (err) {
    console.error("[Sales PWA] get_quotations error:", err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function onSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchQuotations(true), 300);
}

function loadMore() { page.value += 1; fetchQuotations(false); }

function statusClass(status) {
  const map = {
    Draft: "bg-gray-100 text-gray-600",
    Submitted: "bg-blue-100 text-blue-700",
    Open: "bg-yellow-100 text-yellow-700",
    Ordered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-600",
    Lost: "bg-red-100 text-red-600",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatAmount(n) {
  if (!n) return "0";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

onMounted(() => fetchQuotations(true));
</script>
