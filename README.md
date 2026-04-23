# Savings Tracker — Power Apps Code App

A personal savings goal tracker built as a [Power Apps Code App](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/code-components-overview) using **React + TypeScript + Vite**, backed by **Microsoft Dataverse**.

> Frontend Mentor challenge design: [Savings Tracker](https://www.frontendmentor.io/)  
> Figma file: [savings-tracker](https://www.figma.com/design/ngHoDLhrNqmYi7K580gCDf/savings-tracker)

---

## Features

- Create, edit, and delete savings goals
- Log deposits against any goal
- Real-time progress bars and percentage tracking
- Monthly bar chart of deposit history
- Filter & sort goals (status, progress, deadline, name)
- Responsive layout — desktop, tablet, and mobile
- Full Figma-spec dark theme with Inter & Bricolage Grotesque fonts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Platform | Power Apps Code App (PCF-style web app) |
| Data | Microsoft Dataverse |
| Deployment | `power-apps push` via `@microsoft/power-apps-cli` |

---

## Dataverse Structure

The app uses two custom Dataverse tables in the **Saving Tracker Solution** (`SavingTrackerSolution`, publisher prefix `krbork_`).

### `krbork_savingsgoal` — Savings Goal

| Column | Logical Name | Type | Notes |
|---|---|---|---|
| Goal Name | `krbork_name` | Single line of text | Primary column |
| Target Amount | `krbork_targetamount` | Decimal | Target savings amount |
| Deadline | `krbork_deadline` | Date Only | Optional deadline |

### `krbork_deposit` — Deposit

| Column | Logical Name | Type | Notes |
|---|---|---|---|
| Deposit Name | `krbork_name` | Single line of text | Auto-generated label |
| Amount | `krbork_amount` | Decimal | Deposit amount |
| Date | `krbork_date` | Date Only | Date of deposit |
| Savings Goal | `krbork_SavingsGoalId` | Lookup → `krbork_savingsgoal` | Parent goal (cascade delete) |

### Relationship

`krbork_savingsgoal` → `krbork_deposit` is a **one-to-many** relationship with **cascade delete** — deleting a goal removes all its deposits automatically.

### Generated Services

Running `pac code add-data-source -a dataverse -t <table>` generates:

```
src/generated/
  models/
    Krbork_savingsgoalModel.ts
    Krbork_depositModel.ts
  services/
    Krbork_savingsgoalsService.ts
    Krbork_depositsService.ts
```

Usage example:

```typescript
import { Krbork_savingsgoalsService } from './generated/services/Krbork_savingsgoalsService';

const result = await Krbork_savingsgoalsService.getAll({
  select: ['krbork_name', 'krbork_targetamount', 'krbork_deadline'],
  orderBy: ['krbork_name asc'],
});
const goals = result.data ?? [];
```

---

## Power Apps Code App

A **Power Apps Code App** is a React web application packaged and hosted inside Power Platform. It gets full access to the Power Apps runtime, connectors, and Dataverse — while being authored entirely in standard React/TypeScript.

### Cost

Code Apps run inside Power Apps and are subject to standard **Power Apps licensing**:

- **Power Apps Premium** licence required per user (includes Dataverse access)
- No additional per-app fee beyond the licence
- Dataverse storage is pooled — 10 GB base + 2 GB per Premium licence
- See [Power Apps pricing](https://powerapps.microsoft.com/en-us/pricing/) for current rates

### Plugins / Tools Used to Build

| Tool | Purpose |
|---|---|
| [GitHub Copilot CLI](https://githubnext.com/projects/copilot-cli) | AI-assisted development — layout, logic, CSS, Dataverse wiring |
| `@microsoft/power-apps-cli` (`pac`) | Scaffolding, data source generation, deployment (`power-apps push`) |
| `@vitejs/plugin-react` | React Fast Refresh in Vite dev server |
| Power Apps Code App SDK (`@microsoft/powerapps-component-framework`) | Runtime bridge between the web app and Power Platform |
| Azure CLI (`az`) | Dataverse API authentication token acquisition |

---

## Local Development

```bash
npm install
npm run dev
```

### Deploy to Power Apps

```bash
# Authenticate (first time or after token expiry)
az login --tenant <tenant-id> --allow-no-subscriptions --use-device-code

# Build + push
npx --prefix . power-apps push --non-interactive
```

### Environment

Copy `power.config.example.json` to `power.config.json` and fill in your own values:

| Setting | Description |
|---|---|
| Environment ID | Your Power Apps environment GUID |
| Dataverse URL | `https://<your-org>.crm.dynamics.com` |
| Solution | `SavingTrackerSolution` |
| Publisher prefix | `krbork_` |

