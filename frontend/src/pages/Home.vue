<template>
  <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">

    <!-- Placeholder stat cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div style="background:white;border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">Today's Quotes</p>
        <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#1e2d4f;">—</p>
        <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">Coming soon</p>
      </div>
      <div style="background:white;border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">This Month</p>
        <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#1e2d4f;">—</p>
        <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">Coming soon</p>
      </div>
    </div>

    <!-- Target placeholder -->
    <div style="background:white;border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">Monthly Target</p>
        <span style="font-size:12px;color:#9ca3af;">— %</span>
      </div>
      <div style="height:8px;background:#f3f4f6;border-radius:4px;">
        <div style="height:100%;width:0%;background:#1e2d4f;border-radius:4px;"></div>
      </div>
      <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Target data coming soon</p>
    </div>

    <!-- Recent activity placeholder -->
    <div style="background:white;border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#111827;">Recent Activity</p>
      <div v-for="i in 3" :key="i"
           style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f9fafb;">
        <div style="width:32px;height:32px;border-radius:50%;background:#f3f4f6;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="height:10px;background:#f3f4f6;border-radius:4px;width:70%;"></div>
          <div style="height:8px;background:#f9fafb;border-radius:4px;width:45%;margin-top:6px;"></div>
        </div>
      </div>
      <p style="margin:12px 0 0;font-size:11px;color:#d1d5db;text-align:center;">Activity feed coming soon</p>
    </div>

  </div>
</template>
