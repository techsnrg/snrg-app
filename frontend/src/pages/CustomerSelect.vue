<template>
  <div class="flex flex-col h-full">

    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div class="flex items-center mb-3">
        <button class="mr-3 text-gray-400 active:text-gray-600" @click="$router.back()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-base font-semibold text-gray-800">Customers</h1>
      </div>

      <!-- Search input -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search by name…"
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Customer list -->
    <div class="flex-1 overflow-y-auto">

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-2 text-sm text-gray-500">Loading customers…</span>
      </div>

      <!-- Empty state -->
      <div v-else-if="customers.length === 0 && !loading"
           class="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m4-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/>
        </svg>
        <p class="text-sm">No customers found</p>
      </div>

      <!-- List -->
      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="c in customers"
          :key="c.name"
          class="flex items-center px-4 py-3 active:bg-blue-50 cursor-pointer select-none"
          :class="selectedCustomer?.name === c.name ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'"
          @click="selectCustomer(c)"
        >
          <!-- Avatar -->
          <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center
                      justify-center text-sm font-semibold shrink-0 mr-3">
            {{ initials(c.customer_name) }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ c.customer_name }}</p>
            <p class="text-xs text-gray-400 truncate">
              {{ c.territory || c.customer_group || c.name }}
            </p>
          </div>

          <!-- Selected tick -->
          <svg v-if="selectedCustomer?.name === c.name"
               class="w-4 h-4 text-blue-600 shrink-0 ml-2"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M5 13l4 4L19 7"/>
          </svg>
        </li>
      </ul>

      <!-- Load more -->
      <div v-if="hasMore && !loading" class="py-4 flex justify-center">
        <button
          class="text-sm text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <span v-if="loadingMore">Loading…</span>
          <span v-else>Load more</span>
        </button>
      </div>
    </div>

    <!-- Selection confirmation bar -->
    <div v-if="selectedCustomer"
         class="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div class="min-w-0">
        <p class="text-xs opacity-75">Selected</p>
        <p class="text-sm font-semibold truncate">{{ selectedCustomer.customer_name }}</p>
      </div>
      <button class="ml-4 bg-white text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-lg shrink-0">
        Continue →
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const PAGE_SIZE = 20;

const searchTerm = ref("");
const customers = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const page = ref(0);
const selectedCustomer = ref(null);

let debounceTimer = null;

async function fetchCustomers(reset = false) {
  if (reset) {
    page.value = 0;
    customers.value = [];
  }

  const isFirstPage = page.value === 0;
  if (isFirstPage) loading.value = true;
  else loadingMore.value = true;

  try {
    const result = await frappe.call({
      method: "snrg_sales_pwa.api.sales.get_customers",
      args: {
        search: searchTerm.value,
        page: page.value,
        page_size: PAGE_SIZE,
      },
    });

    const rows = result?.message || [];
    customers.value = isFirstPage ? rows : [...customers.value, ...rows];
    hasMore.value = rows.length === PAGE_SIZE;
  } catch (err) {
    console.error("[Sales PWA] get_customers error:", err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function onSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchCustomers(true), 300);
}

function loadMore() {
  page.value += 1;
  fetchCustomers(false);
}

function selectCustomer(c) {
  selectedCustomer.value = selectedCustomer.value?.name === c.name ? null : c;
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

onMounted(() => fetchCustomers(true));
</script>
