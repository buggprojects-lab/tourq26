# Torq Studio — Architecture Package

Enterprise SEO-first CMS architecture for scaling Torq Studio from dozens to 100,000+ pages.

| Document | Description |
|----------|-------------|
| [TORQ-STUDIO-ENTERPRISE-ARCHITECTURE.md](./TORQ-STUDIO-ENTERPRISE-ARCHITECTURE.md) | Full blueprint (IA, folders, APIs, SEO, linking, permissions, Mermaid) |
| [schemas/cms.prisma](./schemas/cms.prisma) | Normalized Mongo/Prisma CMS schema |
| [wireframes/README.md](./wireframes/README.md) | Admin UI wireframe index |
| [diagrams/README.md](./diagrams/README.md) | Diagram index |

**Product name:** Torq Studio  
**Codebase:** `tourq26/` (Next.js 16 + Prisma + existing marketing/hub)

## Implementation note

Do not merge `cms.prisma` into production or run `db push` until explicitly approved — schema merge must preserve the existing Interview Hub models and requires a planned migration.
