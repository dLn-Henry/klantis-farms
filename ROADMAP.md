# Roadmap

One branch and one PR per phase. A phase isn't done until: UI, database
rules, validation, permissions, loading/empty/error states, mobile layout,
and a live test against a real Postgres all exist (see BUILD_LOG.md).

- [ ] **Phase 0 - Unblock the database.** Apply migrations 0008-0016,
      `verify_schema.sql`, docs/ARCHITECTURE, `/app` redirect.
- [ ] **Phase 1 - Dashboard control centre.**
      - [x] 1A Storage + media library (migration 0017)
      - [ ] 1B site settings (name, logo, favicon, SEO, contact) editable from the
      dashboard; blog featured + inline images with a sanitizing editor;
      vet-report photo attachments; richer dashboard home; notifications;
      global search / Ctrl+K; real Settings backend.
- [ ] **Phase 2 - Real products linked to inventory.**
      `product_inventory_sources`; public shop/produce read from the DB;
      product images.
- [ ] **Phase 3 - Commerce with Paystack.** Cart, checkout, order creation
      with stock reservation, verified idempotent webhook, pickup/delivery,
      customer account + tracking, receipts.
- [ ] **Phase 4 - Traceability.** Production batches, public
      `/traceability/[batch]`, QR codes.
- [ ] **Phase 5 - Record depth.** Animal events/weights/vaccinations, crop
      activities, groups, documents, reports + export, real analytics.
- [ ] **Phase 6 - Hardening.** Per-module permissions, tests,
      accessibility, performance, SEO, mobile quick-record.
- [ ] **Phase 7+ - Multi-farm marketplace, offline, sensors, AI.**

## Known items to revisit

- Settings page is a form with no backend (Phase 1).
- Most per-module write permissions beyond approvals are not enforced
  (Phase 6).
