# CMS UI Wireframes — Torq Studio

ASCII wireframes for admin surfaces. Full architecture: [`../TORQ-STUDIO-ENTERPRISE-ARCHITECTURE.md`](../TORQ-STUDIO-ENTERPRISE-ARCHITECTURE.md) §10.

## Screens

| Screen | Purpose | Primary roles |
|--------|---------|---------------|
| Dashboard | KPI + workflow inbox | All |
| Pages list | Filter by type/status/origin | Writers+ |
| Page Builder | Drag-drop blocks + SEO rail | Writers+ |
| Entity editor | Relations graph for Service/etc. | Strategist+ |
| PSEO job | Axis pickers → batch candidates | SEO / Strategist |
| Link Graph | Visual internal links | SEO |
| Leads | Form submissions | Sales |
| Workflow inbox | Role-queued approvals | Reviewers |

## Page Builder layout (canonical)

```
+------------------+---------------------------+----------------------+
| Block palette    | Canvas (ordered blocks)   | Right rail tabs      |
|                  |                           | Content|SEO|Brief|   |
| Layout / Trust / | Live field editors        | Links|Workflow|      |
| Content / Related| Device preview toggle     | Versions             |
| / Conversion     |                           |                      |
+------------------+---------------------------+----------------------+
| Status pill · Save · Submit to next workflow stage · Preview token  |
+---------------------------------------------------------------------+
```

## Validation chips (SEO rail)

- Meta title length
- Meta description length
- H1 present in blocks
- Target keyword set
- Canonical OK
- Schema selection non-empty for money pages
- Content score ≥ template minimum (PSEO)

## Mobile admin

Builder collapses to: Canvas → floating “Add block” → bottom sheet for props; SEO as separate route `/admin/pages/[id]/seo`.
