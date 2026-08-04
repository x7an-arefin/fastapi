# generator-ng-dashboard

A code generator for Angular 21 dashboards using a dual-spec approach (Frontend UI spec + OpenAPI spec).

## What it is

This generator takes two JSON files:
1. `frontend.json`: Describes your dashboard layout, modules, lists, forms, routing, theme, and authentication.
2. `openapi.json`: An OpenAPI 3.x specification of your backend API.

It merges these into an Intermediate Representation (IR) and uses EJS templates to scaffold a complete, production-ready Angular dashboard.

## Prerequisites
- Node.js 20+
- npm

## Installation

```bash
npm install -g generator-ng-dashboard
```

## Quick Start

1. Create a directory for your new project:
   ```bash
   mkdir my-dashboard && cd my-dashboard
   ```
2. Place `frontend.json` and `openapi.json` in the directory.
3. Run the generator:
   ```bash
   npx ng-dashboard generate
   ```

## CLI Commands

| Command | Description |
|---------|-------------|
| `generate` | Generates the Angular app from specs |
| `validate` | Validates `frontend.json` against the schema |
| `plan` | Prints the generated Intermediate Representation (IR) |
| `init` | Creates a sample `frontend.json` and `openapi.json` |

## frontend.json Schema Reference

| Field | Type | Description |
|-------|------|-------------|
| `app` | Object | Global app settings (`name`, `title`, `baseHref`) |
| `api` | Object | API connection info (`baseUrl`) |
| `auth` | Object | Authentication config (`provider`, `loginRedirect`) |
| `theme` | Object | Theming options (`mode`, `primaryColor`) |
| `sidebar` | Object | Sidebar navigation (`collapsible`, `items`) |
| `modules` | Object | Keys are module names. Contains list/form/detail configs |

## Architecture Notes

- **Drawer-first modules**: The generated app favors right-side drawers for Create/Edit/Detail views instead of full-page navigation.
- **Facade pattern**: Uses Angular services with Signals to manage local state, cleanly separating UI components from HTTP calls.

## Contributing

```bash
git clone https://github.com/yourusername/generator-ng-dashboard.git
cd generator-ng-dashboard
npm install
npm run build
```
