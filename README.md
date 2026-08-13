# Ledgerly

> Personal finance, read clearly.

Ledgerly is a private, browser-based expense tracker for recording everyday spending and understanding it through simple visualizations. It is designed around a calm editorial ledger interface: add expenses, set an optional monthly budget, review spending patterns, filter your records, and export your data whenever you need it.

All expense records and the optional budget are stored locally in the browser through `localStorage`. Ledgerly does not require an account, backend, database, or server-side financial data storage.

## Features

| Area | Included functionality |
| --- | --- |
| Expense records | Add, edit, and delete expenses with amount, category, date, and optional note. |
| Dashboard | Total spent, transaction count, largest expense, and daily-average summaries. |
| Visualization | Spending rhythm, category composition, and six-month monthly pulse charts. |
| Budgeting | Set an optional monthly budget and view the amount used and remaining. |
| Filtering | Search by note or category, filter by time period, and filter by category. |
| Export | Download the current local ledger as JSON or CSV. |
| Privacy | Records remain in the current browser unless the user exports or clears them. |
| Responsive UI | Editorial desktop rail with a responsive mobile layout. |
| Discoverability | Descriptive metadata, Open Graph tags, JSON-LD, `robots.txt`, and `sitemap.xml`. |

## Tech stack

Ledgerly is built as a static React application with TypeScript. The project uses Vite for development and production builds, Recharts for the data visualizations, Lucide React for interface icons, Tailwind CSS and custom CSS tokens for styling, and Sonner for lightweight notifications.

## Getting started

### Requirements

- Node.js 20 or newer
- pnpm 10 or newer

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The development server is configured to listen on the Vite host and will print its local URL in the terminal.

### Validation

Run the TypeScript check and production build before sharing changes:

```bash
pnpm run check
pnpm run build
```

The project also includes the following scripts:

```bash
pnpm run preview   # Preview the production build
pnpm run start     # Start the bundled production server
pnpm run format    # Format project files with Prettier
```

## How data is stored

Ledgerly uses two browser-local keys:

| Key | Purpose |
| --- | --- |
| `ledgerly-expenses` | Stores the user-created expense records. |
| `ledgerly-budget` | Stores the optional budget amount. |

Because the data is local, it is specific to the browser profile and device where it was entered. Clearing site data, changing browsers, or using private browsing can remove access to those records. Use JSON or CSV export to keep a personal backup.

## Export formats

The **JSON export** preserves the expense objects in a machine-readable format. The **CSV export** includes the date, category, amount, and note columns for use in spreadsheets or other finance tools. Both exports are generated in the browser and downloaded as `ledgerly-expenses.json` or `ledgerly-expenses.csv`.

## SEO and publishing

The document shell includes a descriptive title and description, canonical URL, robots directive, Open Graph metadata, Twitter card metadata, and a `WebApplication` JSON-LD block. The static public files include:

- `client/public/robots.txt`
- `client/public/sitemap.xml`

Search engines can index a site only after it is published at a publicly reachable URL. After publishing, update the canonical URL and sitemap host in `client/index.html` and `client/public/sitemap.xml` if the final domain differs from the configured address. Submitting the final sitemap in Google Search Console can help Google discover the site, but indexing and ranking are controlled by Google and are not immediate or guaranteed.

## Project structure

```text
client/
  index.html              # SEO-aware document shell
  public/                 # robots.txt, sitemap.xml, and small public files
  src/
    pages/Home.tsx        # Ledgerly dashboard and expense interactions
    index.css             # Paper & Signal visual system and responsive layout
    App.tsx               # Application shell and routing
server/
  index.ts                # Static production server used by the template
```

## Repository

The source repository is available at [github.com/vincenzo-afk/Ledgerly](https://github.com/vincenzo-afk/Ledgerly).

## Privacy note

Ledgerly is a frontend-only personal ledger. It is not a bank connection, financial adviser, accounting service, or emergency record system. Review exported files carefully before sharing them because they may contain personal spending information.

## License

This project is distributed under the MIT License. See [`LICENSE`](./LICENSE) for the full license text.

## Maintainer

Ledgerly is maintained by **BHARANI KUMAR S**.
