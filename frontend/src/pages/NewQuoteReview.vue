<template>
  <div style="display:flex;flex-direction:column;height:100%;background:#f9fafb;">

    <!-- Success screen -->
    <div v-if="submitted" style="flex:1;display:flex;flex-direction:column;
                                  align-items:center;justify-content:center;padding:32px;text-align:center;">
      <div style="width:72px;height:72px;border-radius:50%;background:#d1fae5;
                  display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <svg width="36" height="36" fill="none" stroke="#059669" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Quotation Created!</h2>
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">Your quotation has been saved.</p>
      <p style="margin:0 0 28px;font-size:16px;font-weight:700;color:#1e2d4f;
                background:#eff6ff;padding:8px 20px;border-radius:8px;letter-spacing:0.5px;">
        {{ createdName }}
      </p>
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;">
        <button @click="newQuote"
                style="padding:13px;background:#1e2d4f;color:white;border:none;
                       border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">
          New Quote
        </button>
        <button @click="$router.push('/quotations')"
                style="padding:13px;background:white;color:#1e2d4f;border:1.5px solid #1e2d4f;
                       border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">
          View Quotations
        </button>
      </div>
    </div>

    <!-- Review screen -->
    <template v-else>
      <!-- Step header -->
      <div style="background:#1e2d4f;padding:12px 16px 14px;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
          <div style="flex:1;height:3px;border-radius:2px;background:#60a5fa;"></div>
          <div style="flex:1;height:3px;border-radius:2px;background:#60a5fa;"></div>
          <div style="flex:1;height:3px;border-radius:2px;background:#60a5fa;position:relative;">
            <div style="position:absolute;inset:0;background:#60a5fa;border-radius:2px;"></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <p style="margin:0 0 2px;font-size:11px;color:#93c5fd;">Step 3 of 3</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:white;">Review & Submit</p>
          </div>
          <button @click="$router.back()"
                  style="border:none;background:rgba(255,255,255,0.15);border-radius:8px;
                         padding:6px 12px;color:white;font-size:13px;cursor:pointer;">
            ← Edit Items
          </button>
        </div>
      </div>

      <!-- Scrollable content -->
      <div style="flex:1;overflow-y:auto;padding:12px;">

        <!-- Customer card -->
        <div style="background:white;border-radius:12px;padding:14px 16px;
                    margin-bottom:10px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Customer</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#1e2d4f;
                        color:white;display:flex;align-items:center;justify-content:center;
                        font-size:14px;font-weight:600;flex-shrink:0;">
              {{ initials(store.state.customer?.customer_name) }}
            </div>
            <div>
              <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">
                {{ store.state.customer?.customer_name }}
              </p>
              <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">
                {{ store.state.customer?.customer_group || store.state.customer?.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Items card -->
        <div style="background:white;border-radius:12px;padding:14px 16px;
                    margin-bottom:10px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
            Items ({{ store.state.items.length }})
          </p>

          <!-- Header row -->
          <div style="display:flex;padding:0 0 8px;border-bottom:1px solid #f3f4f6;margin-bottom:4px;">
            <span style="flex:1;font-size:11px;color:#9ca3af;font-weight:500;">ITEM</span>
            <span style="width:40px;text-align:center;font-size:11px;color:#9ca3af;font-weight:500;">QTY</span>
            <span style="width:70px;text-align:right;font-size:11px;color:#9ca3af;font-weight:500;">RATE</span>
            <span style="width:80px;text-align:right;font-size:11px;color:#9ca3af;font-weight:500;">AMOUNT</span>
          </div>

          <!-- Item rows -->
          <div v-for="item in store.state.items" :key="item.item_code"
               style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #f9fafb;">
            <div style="flex:1;min-width:0;padding-right:8px;">
              <p style="margin:0;font-size:13px;font-weight:500;color:#111827;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ item.item_name }}
              </p>
              <p style="margin:1px 0 0;font-size:11px;color:#9ca3af;">{{ item.item_code }}</p>
            </div>
            <span style="width:40px;text-align:center;font-size:13px;color:#374151;font-weight:500;">
              {{ item.qty }}
            </span>
            <span style="width:70px;text-align:right;font-size:12px;color:#6b7280;">
              {{ fmtINR(item.rate) }}
            </span>
            <span style="width:80px;text-align:right;font-size:13px;font-weight:600;color:#111827;">
              {{ fmtINR(item.amount) }}
            </span>
          </div>
        </div>

        <!-- Totals card -->
        <div style="background:white;border-radius:12px;padding:14px 16px;
                    margin-bottom:10px;border:1px solid #e5e7eb;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#6b7280;">Subtotal</span>
            <span style="font-size:13px;color:#374151;font-weight:500;">{{ fmtINR(store.totalAmount.value) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#6b7280;">Tax</span>
            <span style="font-size:13px;color:#9ca3af;">Computed on save</span>
          </div>
          <div style="border-top:1px solid #f3f4f6;margin-top:8px;padding-top:8px;
                      display:flex;justify-content:space-between;">
            <span style="font-size:15px;font-weight:700;color:#111827;">Total</span>
            <span style="font-size:16px;font-weight:700;color:#1e2d4f;">{{ fmtINR(store.totalAmount.value) }}</span>
          </div>
        </div>

        <!-- Spacer for submit button -->
        <div style="height:80px;"></div>
      </div>

      <!-- Submit button -->
      <div style="position:absolute;bottom:0;left:0;right:0;background:white;
                  border-top:1px solid #e5e7eb;padding:12px 16px;
                  padding-bottom:calc(12px + env(safe-area-inset-bottom));">
        <button @click="submitQuote" :disabled="submitting"
                style="width:100%;padding:14px;border:none;border-radius:10px;
                       font-size:15px;font-weight:700;cursor:pointer;
                       display:flex;align-items:center;justify-content:center;gap:8px;"
                :style="submitting
                        ? 'background:#9ca3af;color:white;cursor:not-allowed;'
                        : 'background:#1e2d4f;color:white;'">
          <div v-if="submitting"
               style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);
                      border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
          <svg v-else width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          {{ submitting ? "Submitting…" : "Submit Quotation" }}
        </button>
        <p v-if="errorMsg" style="margin:8px 0 0;text-align:center;font-size:12px;color:#ef4444;">
          {{ errorMsg }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuoteStore } from "../composables/useQuoteStore.js";

const router    = useRouter();
const store     = useQuoteStore();
const submitting = ref(false);
const submitted  = ref(false);
const createdName = ref("");
const errorMsg   = ref("");

// Redirect if cart is empty or no customer
if (!store.state.customer || store.state.items.length === 0) {
  router.replace("/new-quote/customer");
}

async function submitQuote() {
  if (submitting.value) return;
  submitting.value = true;
  errorMsg.value   = "";

  const offlineId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const res = await window.frappe.call({
      method: "snrg_sales_pwa.api.sales.create_quotation",
      args: {
        customer: store.state.customer.name,
        items: JSON.stringify(store.state.items.map(i => ({
          item_code: i.item_code,
          qty: i.qty,
          rate: i.rate,
        }))),
        custom_offline_id: offlineId,
      },
    });

    const result = res?.message;
    if (!result?.quotation) throw new Error("No quotation name returned.");

    createdName.value = result.quotation;
    submitted.value   = true;
    store.clearQuote();
  } catch (e) {
    errorMsg.value = e?.message || "Failed to create quotation. Please try again.";
  } finally {
    submitting.value = false;
  }
}

function newQuote() {
  store.clearQuote();
  router.push("/new-quote/customer");
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
}

function fmtINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
</style>
