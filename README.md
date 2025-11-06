# Personal Finance Tracker

A responsive web application to help you track bank accounts, budgets, and expenses—built with React, TypeScript, Vite and Supabase.

## Live Demo
The project is now live! You can check it out here: [Personal Finance Tracker - Live](https://personal-finance-tracker-eosin-eight.vercel.app/)

---

## 1. Project Overview

**Personal Finance Tracker** provides an intuitive dashboard to:

- Connect multiple bank accounts  
- Create and allocate budgets by category  
- Log and categorize daily expenses  
- Visualize spending and remaining budget  

All data is synced in real time via Supabase (PostgreSQL + Auth).

---

## 2. Key Features

- **Authentication & Authorization**  
  - Sign up, log in, password reset  
  - Session management via Supabase Auth  
- **Bank Account Management**  
  - Add, list, edit and remove accounts  
- **Budgeting**  
  - Create budgets by category  
  - Allocate amounts and track progress  
- **Expense Tracking**  
  - Log expenses against budgets  
  - View recent transactions and trends  
- **Responsive UI**  
  - Mobile-first design with Tailwind CSS and shadcn/ui components  

---

## 3. Tech Stack

- **Frontend**  
  - React 18 + Vite  
  - TypeScript  
  - Tailwind CSS & PostCSS  
  - shadcn/ui component library  
- **Backend & Database**  
  - Supabase (PostgreSQL + Auth)  
- **Deployment**  
  - Vercel

## 4. Environment Variables

Create a `.env` file in project root:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js**
- **npm** or **yarn**

### Cloning the Repository

1. Visit the GitHub repository at `https://github.com/sainithinkatta/personal-finance-tracker`
2. Select where you want to clone the repository
3. Clone the repository:
   ```bash
   git clone https://github.com/sainithinkatta/personal-finance-tracker.git
   ```

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Mobile experience updates

- Mobile layout now uses a compact safe-area-aware main wrapper and scrollable tab bar. Adjust spacing or typography tokens in `src/index.css` (`pb-safe`, `pt-safe`, `touch-target`, and rhythm utilities) or update responsive wrappers inside `src/pages/Index.tsx`.
- Form controls share the new rounded `h-11` styles from `ExpenseForm`, `DueForm`, and recurring transaction forms. Tweak input sizing or radii directly in those components.
- Bottom sheet dialogs are powered by `ResponsiveSheet` (`src/components/layout/ResponsiveSheet.tsx`). Modify global sheet padding or header styles there when introducing new sheets.
- Test the mobile experience with `npm run dev` and resize the browser to 360–430px widths or use device emulation (e.g., Chrome DevTools iPhone 15 Pro profile) to verify safe-area padding, sticky headers, and FAB placement.

## Contributors
Sai Nithin Reddy Katta.
