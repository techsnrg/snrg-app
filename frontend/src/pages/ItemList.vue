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
        <h1 class="text-base font-semibold text-gray-800">Items</h1>
      </div>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search by name or code…"
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-2 text-sm text-gray-500">Loading items…</span>
      </div>

      <div v-else-if="items.length === 0"
           class="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12l-2-4z"/>
        </svg>
        <p class="text-sm">No items found</p>
      </div>

      <ul v-else class="divide-y divide-gray-100">
        <li v-for="item in items" :key="item.name"
            class="flex items-center px-4 py-3 bg-white hover:bg-gray-50">
          <div class="w-9 h-9 rounded-full bg-yellow-100 text-yellow-600 flex items-center
                      justify-center text-xs font-bold shrink-0 mr-3">
            {{ item.item_code?.slice(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ item.item_name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ item.item_code }} · {{ item.item_group }}</p>
          </div>
        </li>
      </ul>

      <div v-if="hasMore && !loading" class="py-4 flex justify-center">
        <button class="text-sm text-yellow-600 font-medium px-4 py-2 rounded-lg hover:bg-yellow-50"
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
const items = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const page = ref(0);
let debounceTimer = null;

async function fetchItems(reset = false) {
  if (reset) { page.value = 0; items.value = []; }
  const isFirst = page.value === 0;
  if (isFirst) loading.value = true; else loadingMore.value = true;
  try {
    const result = await frappe.call({
      method: "snrg_sales_pwa.api.sales.get_items",
      args: { search: searchTerm.value, page: page.value, page_size: PAGE_SIZE },
    });
    const rows = result?.message || [];
    items.value = isFirst ? rows : [...items.value, ...rows];
    hasMore.value = rows.length === PAGE_SIZE;
  } catch (err) {
    console.error("[Sales PWA] get_items error:", err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function onSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchItems(true), 300);
}

function loadMore() { page.value += 1; fetchItems(false); }

onMounted(() => fetchItems(true));
</script>
