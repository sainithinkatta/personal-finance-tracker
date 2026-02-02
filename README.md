# Fingo

A responsive web application to help you track bank accounts, budgets, and expenses—built with React, TypeScript, Vite and Supabase.

## Live Demo
The project is now live! You can check it out here: [Fingo - Live](https://fin-go-one.vercel.app/)

---

## 1. Project Overview

**Fingo** provides an intuitive dashboard to:

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

## Contributors
Sai Nithin Reddy Katta.
