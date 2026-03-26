<template>
  <div class="flex flex-col h-full bg-gray-50">

    <!-- Header -->
    <div class="px-5 pt-10 pb-6" style="background:#1e2d4f;">
      <p class="text-xs text-blue-200 font-medium tracking-widest uppercase mb-1">Gold Coast Electricals</p>
      <h1 class="text-2xl font-bold text-white">Sales App</h1>
    </div>

    <!-- Nav tiles -->
    <div class="flex-1 px-4 pt-6 space-y-3">

      <button
        v-for="tile in tiles"
        :key="tile.route"
        class="w-full flex items-center bg-white rounded-2xl shadow-sm px-4 py-4
               active:scale-95 transition-transform"
        @click="$router.push(tile.route)"
      >
        <!-- Round icon -->
        <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4"
             :style="{ background: tile.bg }">
          <component :is="tile.icon" class="w-6 h-6" :style="{ color: tile.color }" />
        </div>

        <!-- Label -->
        <div class="flex-1 text-left">
          <p class="text-sm font-semibold text-gray-800">{{ tile.label }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ tile.sub }}</p>
        </div>

        <!-- Arrow -->
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

    </div>

  </div>
</template>

<script setup>
import { h } from "vue";

// Inline SVG icon components so no extra dependency is needed
const IconCustomer = {
  render: () => h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
    h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2",
      d: "M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m4-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" }),
  ]),
};
const IconItem = {
  render: () => h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
    h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2",
      d: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12l-2-4z" }),
  ]),
};
const IconQuotation = {
  render: () => h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
    h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2",
      d: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z" }),
  ]),
};

const tiles = [
  {
    label: "Customers",
    sub: "Browse & search customers",
    route: "/customers",
    icon: IconCustomer,
    bg: "#e0e7ff",
    color: "#4f46e5",
  },
  {
    label: "Items",
    sub: "Browse product catalog",
    route: "/items",
    icon: IconItem,
    bg: "#fef3c7",
    color: "#d97706",
  },
  {
    label: "Quotations",
    sub: "View submitted quotations",
    route: "/quotations",
    icon: IconQuotation,
    bg: "#dcfce7",
    color: "#16a34a",
  },
];
</script>
