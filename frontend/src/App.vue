<template>
  <!-- The parent #snrg-sales-pwa-app is already position:fixed;inset:0 (set by sales_pwa.js)
       so this div just needs to fill it with the flex column layout -->
  <div style="display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden;">

    <!-- ═══ FIXED HEADER ═══ -->
    <header style="background:#1e2d4f;flex-shrink:0;padding:12px 16px;display:flex;
                   align-items:center;justify-content:space-between;z-index:40;">
      <!-- Logo + Greeting -->
      <div style="display:flex;align-items:center;gap:10px;">
        <img :src="logoUrl"
             style="width:38px;height:38px;border-radius:10px;object-fit:cover;flex-shrink:0;" />
        <div>
          <p style="color:#93c5fd;font-size:11px;margin:0;line-height:1.2;">{{ greeting }}</p>
          <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0;line-height:1.3;">{{ firstName }}</p>
        </div>
      </div>

      <!-- Icons -->
      <div style="display:flex;gap:4px;align-items:center;">
        <!-- Search -->
        <button @click="searchOpen = true"
                style="width:38px;height:38px;border-radius:50%;border:none;
                       background:rgba(255,255,255,0.12);cursor:pointer;
                       display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
        </button>

        <!-- Bell -->
        <button @click="openNotifications"
                style="width:38px;height:38px;border-radius:50%;border:none;position:relative;
                       background:rgba(255,255,255,0.12);cursor:pointer;
                       display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 1 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"/>
          </svg>
          <span v-if="unreadCount > 0"
                style="position:absolute;top:4px;right:4px;background:#ef4444;color:white;
                       font-size:9px;font-weight:700;border-radius:999px;
                       min-width:14px;height:14px;display:flex;align-items:center;
                       justify-content:center;padding:0 3px;line-height:1;">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>
      </div>
    </header>

    <!-- ═══ SCROLLABLE CONTENT ═══ -->
    <main style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">
      <router-view />
    </main>

    <!-- ═══ FIXED BOTTOM NAV ═══ -->
    <nav style="background:white;border-top:1px solid #e5e7eb;flex-shrink:0;
                display:flex;padding-bottom:env(safe-area-inset-bottom);z-index:40;">
      <button v-for="tab in tabs" :key="tab.route"
              @click="$router.push(tab.route)"
              style="flex:1;border:none;background:transparent;cursor:pointer;
                     padding:8px 0 6px;display:flex;flex-direction:column;
                     align-items:center;gap:3px;">
        <div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;"
             :style="isActive(tab.route) ? 'color:#1e2d4f' : 'color:#9ca3af'">
          <component :is="tab.icon" />
        </div>
        <span style="font-size:10px;font-weight:500;"
              :style="isActive(tab.route) ? 'color:#1e2d4f' : 'color:#9ca3af'">
          {{ tab.label }}
        </span>
        <span v-if="isActive(tab.route)"
              style="width:16px;height:3px;background:#1e2d4f;border-radius:2px;margin-top:1px;"></span>
      </button>
    </nav>

    <!-- ═══ SEARCH OVERLAY ═══ -->
    <transition name="fade">
      <div v-if="searchOpen"
           style="position:absolute;inset:0;z-index:80;background:white;
                  display:flex;flex-direction:column;">
        <!-- Search bar -->
        <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;
                    display:flex;align-items:center;gap:10px;background:#1e2d4f;">
          <button @click="closeSearch"
                  style="border:none;background:none;cursor:pointer;padding:0;flex-shrink:0;">
            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style="flex:1;position:relative;">
            <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);"
                 width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input ref="searchInput" v-model="searchQuery" @input="onSearchInput"
                   type="search" placeholder="Search customers…"
                   style="width:100%;box-sizing:border-box;padding:8px 12px 8px 32px;
                          border-radius:8px;border:none;background:rgba(255,255,255,0.15);
                          color:white;font-size:14px;outline:none;"
                   autocomplete="off" />
          </div>
        </div>

        <!-- Results -->
        <div style="flex:1;overflow-y:auto;">
          <div v-if="searchLoading" style="display:flex;align-items:center;justify-content:center;padding:32px;gap:8px;">
            <div style="width:20px;height:20px;border:2px solid #1e2d4f;border-top-color:transparent;
                        border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            <span style="font-size:13px;color:#6b7280;">Searching…</span>
          </div>
          <div v-else-if="searchQuery && searchResults.length === 0"
               style="text-align:center;padding:32px;color:#9ca3af;font-size:13px;">
            No customers found
          </div>
          <div v-else-if="!searchQuery"
               style="text-align:center;padding:48px 24px;color:#9ca3af;font-size:13px;">
            Type a name to search customers
          </div>
          <ul v-else style="list-style:none;margin:0;padding:0;">
            <li v-for="c in searchResults" :key="c.name"
                @click="selectSearchResult(c)"
                style="display:flex;align-items:center;padding:12px 16px;
                       border-bottom:1px solid #f3f4f6;cursor:pointer;background:white;">
              <div style="width:38px;height:38px;border-radius:50%;background:#e0e7ff;
                          color:#4f46e5;display:flex;align-items:center;justify-content:center;
                          font-size:13px;font-weight:600;flex-shrink:0;margin-right:12px;">
                {{ initials(c.customer_name) }}
              </div>
              <div style="flex:1;min-width:0;">
                <p style="margin:0;font-size:14px;font-weight:500;color:#111827;
                          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  {{ c.customer_name }}
                </p>
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  {{ c.customer_group || c.territory || c.name }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <!-- ═══ NOTIFICATION DRAWER ═══ -->
    <transition name="slide-up">
      <div v-if="notifOpen" style="position:absolute;inset:0;z-index:80;">
        <!-- Backdrop -->
        <div @click="notifOpen = false"
             style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>

        <!-- Drawer -->
        <div style="position:absolute;bottom:0;left:0;right:0;background:white;
                    border-radius:20px 20px 0 0;max-height:75%;display:flex;flex-direction:column;
                    padding-bottom:env(safe-area-inset-bottom);">
          <!-- Handle + Header -->
          <div style="padding:12px 16px 8px;border-bottom:1px solid #f3f4f6;">
            <div style="width:36px;height:4px;background:#e5e7eb;border-radius:2px;margin:0 auto 12px;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">Notifications</p>
              <button v-if="notifications.some(n => !n.read)" @click="markAllRead"
                      style="font-size:12px;color:#1e2d4f;font-weight:600;
                             border:none;background:none;cursor:pointer;padding:4px 8px;">
                Mark all read
              </button>
            </div>
          </div>

          <!-- List -->
          <div style="flex:1;overflow-y:auto;">
            <div v-if="notifLoading"
                 style="display:flex;align-items:center;justify-content:center;padding:32px;gap:8px;">
              <div style="width:20px;height:20px;border:2px solid #1e2d4f;
                          border-top-color:transparent;border-radius:50%;
                          animation:spin 0.8s linear infinite;"></div>
            </div>
            <div v-else-if="notifications.length === 0"
                 style="text-align:center;padding:32px;color:#9ca3af;font-size:13px;">
              No notifications
            </div>
            <ul v-else style="list-style:none;margin:0;padding:0;">
              <li v-for="n in notifications" :key="n.name"
                  @click="markRead(n)"
                  style="display:flex;align-items:flex-start;padding:12px 16px;
                         border-bottom:1px solid #f9fafb;cursor:pointer;gap:10px;"
                  :style="n.read ? 'background:white' : 'background:#f0f4ff'">
                <!-- Unread dot -->
                <div style="margin-top:5px;flex-shrink:0;">
                  <div v-if="!n.read"
                       style="width:8px;height:8px;border-radius:50%;background:#1e2d4f;"></div>
                  <div v-else style="width:8px;"></div>
                </div>
                <div style="flex:1;min-width:0;">
                  <p style="margin:0;font-size:13px;line-height:1.4;"
                     :style="n.read ? 'color:#6b7280' : 'color:#111827;font-weight:500'">
                    {{ n.subject }}
                  </p>
                  <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">
                    {{ relativeTime(n.creation) }}
                    <span v-if="n.document_type"> · {{ n.document_type }}</span>
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, h } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Runtime asset URL — not a Vite import so it works in IIFE bundle
const logoUrl = "/assets/snrg_sales_pwa/icons/icon-192.png";

// ── User info ──────────────────────────────────────────────────────────────
const userFullName = computed(() => {
  try { return window.frappe?.boot?.user?.full_name || window.frappe?.session?.user_fullname || ""; }
  catch { return ""; }
});

const firstName = computed(() => userFullName.value.split(" ")[0] || "User");

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
});

// ── Bottom nav tabs ────────────────────────────────────────────────────────
const IconHome = { render: () => h("svg", { width: 22, height: 22, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0h6" })]) };
const IconPlus = { render: () => h("svg", { width: 22, height: 22, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M12 4v16m8-8H4" })]) };
const IconDoc  = { render: () => h("svg", { width: 22, height: 22, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z" })]) };
const IconPeople = { render: () => h("svg", { width: 22, height: 22, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m4-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" })]) };
const IconBox  = { render: () => h("svg", { width: 22, height: 22, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V11" })]) };

const tabs = [
  { label: "Home",      route: "/",           icon: IconHome },
  { label: "New Quote", route: "/customers",  icon: IconPlus },
  { label: "Quotations",route: "/quotations", icon: IconDoc  },
  { label: "Customers", route: "/customers",  icon: IconPeople },
  { label: "Items",     route: "/items",      icon: IconBox  },
];

function isActive(tabRoute) {
  if (tabRoute === "/" ) return route.path === "/";
  return route.path === tabRoute;
}

// ── Search ─────────────────────────────────────────────────────────────────
const searchOpen    = ref(false);
const searchQuery   = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const searchInput   = ref(null);
let searchTimer     = null;

async function openSearch() {
  searchOpen.value  = true;
  searchQuery.value = "";
  searchResults.value = [];
  await nextTick();
  searchInput.value?.focus();
}

function closeSearch() {
  searchOpen.value  = false;
  searchQuery.value = "";
  searchResults.value = [];
}

function onSearchInput() {
  clearTimeout(searchTimer);
  if (!searchQuery.value.trim()) { searchResults.value = []; return; }
  searchTimer = setTimeout(runSearch, 300);
}

async function runSearch() {
  searchLoading.value = true;
  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.get_customers",
      args: { search: searchQuery.value, page: 0, page_size: 20 },
    });
    searchResults.value = res?.message || [];
  } catch { searchResults.value = []; }
  finally { searchLoading.value = false; }
}

function selectSearchResult(c) {
  closeSearch();
  router.push("/customers");
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
}

// ── Notifications ──────────────────────────────────────────────────────────
const notifOpen    = ref(false);
const notifLoading = ref(false);
const notifications = ref([]);
const unreadCount   = ref(0);

async function fetchUnreadCount() {
  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.get_notification_count",
    });
    unreadCount.value = res?.message?.count || 0;
  } catch { /* silent */ }
}

async function openNotifications() {
  notifOpen.value   = true;
  notifLoading.value = true;
  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.get_notifications",
      args: { limit: 15 },
    });
    notifications.value = res?.message?.notifications || [];
    unreadCount.value   = res?.message?.unread_count  || 0;
  } catch { notifications.value = []; }
  finally { notifLoading.value = false; }
}

async function markRead(n) {
  if (n.read) return;
  n.read = 1;
  unreadCount.value = Math.max(0, unreadCount.value - 1);
  try {
    await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.mark_notification_read",
      args: { name: n.name },
    });
  } catch { /* silent */ }
}

async function markAllRead() {
  notifications.value.forEach(n => n.read = 1);
  unreadCount.value = 0;
  try {
    await window.frappe.call({ method: "snrg_sales_pwa.api.sales.mark_all_notifications_read" });
  } catch { /* silent */ }
}

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

onMounted(() => {
  fetchUnreadCount();
  // Refresh count every 60s
  setInterval(fetchUnreadCount, 60000);
});
</script>

<style>
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: transform 0.3s ease; }
.slide-up-leave-active { transition: transform 0.25s ease; }
.slide-up-enter-from .slide-up-leave-to { transform: translateY(100%); }
</style>
