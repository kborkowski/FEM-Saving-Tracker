# Savings Tracker — Power Apps Code App

A personal savings goal tracker built as a [Power Apps Code App](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/code-components-overview) using **React + TypeScript + Vite**, backed by **Microsoft Dataverse**.

> Frontend Mentor challenge design: [Savings Tracker](https://www.frontendmentor.io/)

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
| Goal Name | `krbork_name` | Single line of text | Primary column; displayed as card title |
| Target Amount | `krbork_targetamount` | Currency (Decimal) | Savings target; used to compute progress % |
| Deadline | `krbork_deadline` | Date Only | Optional; shown in card meta row |
| Created On | `createdon` / `overriddencreatedon` | Date/Time | Used for sort-by-date; overridden when seeding |

**Fields read by the app:** `krbork_savingsgoalid`, `krbork_name`, `krbork_targetamount`, `krbork_deadline`, `createdon`

### `krbork_deposit` — Deposit

| Column | Logical Name | Type | Notes |
|---|---|---|---|
| Deposit Label | `krbork_name` | Single line of text | Auto-set to `"Deposit"` or user-provided note |
| Amount | `krbork_amount` | Currency (Decimal) | Deposit value; summed to compute total saved |
| Deposit Date | `krbork_depositdate` | Date Only | Displayed in history list and monthly chart |
| Savings Goal | `krbork_SavingsGoalId` | Lookup → `krbork_savingsgoal` | Parent goal; read back as `_krbork_savingsgoalid_value` |

**Fields read by the app:** `krbork_depositid`, `krbork_name`, `krbork_amount`, `krbork_depositdate`, `_krbork_savingsgoalid_value`, `createdon`

### Relationship

`krbork_savingsgoal` → `krbork_deposit` is a **one-to-many** relationship with **cascade delete** — deleting a goal removes all its deposits automatically.

### How the app uses Dataverse

- On load, goals and deposits are fetched in parallel via `getAll()` and joined client-side by `_krbork_savingsgoalid_value`
- Progress % is computed in the browser: `sum(deposits.amount) / goal.targetamount`
- Card colour (grey / orange gradient / green) is derived from progress % — not stored in Dataverse
- CRUD operations go through the generated services; state is updated locally after each successful API call

### Generated Services

Running `pac code add-data-source -a dataverse -t <table>` generates:

```
src/generated/
  models/
    Krbork_savingsgoalsModel.ts   ← Krbork_savingsgoalsBase + Krbork_savingsgoals interfaces
    Krbork_depositsModel.ts       ← Krbork_depositsBase + Krbork_deposits interfaces
    CommonModels.ts
  services/
    Krbork_savingsgoalsService.ts ← getAll / get / create / update / delete
    Krbork_depositsService.ts     ← getAll / get / create / update / delete
```

Usage example:

```typescript
import { Krbork_savingsgoalsService } from './generated/services/Krbork_savingsgoalsService';
import { Krbork_depositsService } from './generated/services/Krbork_depositsService';

// Fetch all goals
const goalsResult = await Krbork_savingsgoalsService.getAll({
  select: ['krbork_savingsgoalid', 'krbork_name', 'krbork_targetamount', 'krbork_deadline', 'createdon'],
});

// Fetch all deposits (client-side join via _krbork_savingsgoalid_value)
const depositsResult = await Krbork_depositsService.getAll({
  select: ['krbork_depositid', 'krbork_name', 'krbork_amount', 'krbork_depositdate', '_krbork_savingsgoalid_value', 'createdon'],
});
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

