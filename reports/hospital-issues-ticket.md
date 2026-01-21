# Hospital Issues Report

- Ticket ID: HOSP-0001
- Created: 2025-12-05
- Created by: automated report
- Severity: High
- Department: Engineering / Frontend

## Summary

This ticket captures the issues discovered in the Vikram Hospital feedback app and the immediate fixes applied.

## Issues Found

1. Navigation buttons (OPD / IPD / Admin) were not clickable.

   - Files inspected: `src/App.tsx`, `src/components/Dashboard.tsx`.
   - Cause: overlay/background elements and z-index ordering captured pointer events; some background elements lacked `pointer-events-none` and the nav had a lower z-index.
   - Fix applied: Added `pointer-events-none` to dashboard background and raised nav z-index to `z-30` in `src/components/Dashboard.tsx`.

2. Double scrollbars (two scroll options) appeared.

   - Files inspected: `src/components/OPDFeedback.tsx`, `src/components/IPDFeedback.tsx`, `src/components/AdminPanel.tsx`, `src/App.tsx`.
   - Cause: multiple nested elements used `h-screen` which forces full viewport height and creates inner scroll containers inside a page-scrolling container.
   - Fix applied: Replaced inner `h-screen` usages with `min-h-screen` in the components above and updated the wrapper in `src/App.tsx` to `min-h-screen` to avoid nested scrolling.

3. JSX parse error on `src/App.tsx` during Vite build.
   - Error: Unexpected token at a mismatched/stray closing tag.
   - Cause: Previous edits introduced a stray `</div>` and misaligned JSX fragment structure.
   - Fix applied: Restored valid JSX fragment structure and re-integrated header/main/footer; ensured consistent indentation and fragment usage.

## Files Modified

- `src/components/Dashboard.tsx` — set background `pointer-events-none`, increased nav `z-index`.
- `src/components/OPDFeedback.tsx` — changed `w-full h-screen overflow-y-auto` → `w-full min-h-screen`.
- `src/components/IPDFeedback.tsx` — changed `w-full h-screen overflow-y-auto` → `w-full min-h-screen`.
- `src/components/AdminPanel.tsx` — changed `w-full h-screen ... overflow-y-auto` → `w-full min-h-screen ...`.
- `src/App.tsx` — fixed JSX structure; replaced inner `h-screen` with `min-h-screen`; integrated `ReportNavbar` and `ReportTicket`.
- `src/components/ReportNavbar.tsx` — NEW component with "Raise Ticket" button.
- `src/components/ReportTicket.tsx` — NEW modal component that lets user download a markdown ticket.

## Reproduction Steps

1. Start dev server:

   npm install
   npm run dev

2. Open the app in browser.
3. Navigate between Dashboard, OPD, IPD, and Admin. Confirm:
   - Nav buttons are clickable.
   - There is only one scrollbar on the page.
   - No Vite JSX parse errors on build/start.
4. Click the "Raise Ticket" button (top-right) to open the ticket modal and download a ticket file with the issue details.

## Recommended Next Actions

- Add backend endpoint to receive tickets rather than downloading Markdown on the client.
- Add automated E2E tests (Cypress/Playwright) to verify nav clicks and single-scroll behavior across major views.
- Audit other uses of `position: absolute` and `h-screen` for potential overlay issues and update to `pointer-events-none` or `min-h-screen` as appropriate.
- Add logging to capture any runtime errors users see in production.

## Notes

- The client-side "Download Ticket" flow is implemented as a quick way to create a ticket file locally. Modify `src/components/ReportTicket.tsx` to POST ticket data to a backend when ready.

---

Generated automatically on 2025-12-05.
