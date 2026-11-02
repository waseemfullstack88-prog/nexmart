# 🛒 NexMart — Full-Stack Multi-App E-Commerce Monorepo

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> 🚧 **Status:** Active Development (Work in Progress)

**NexMart** is a modern, scalable e-commerce platform architected as a **Turborepo monorepo**. It separates the customer-facing storefront, the merchant admin portal, the backend REST API, and shared TypeScript packages into clean, modular workspaces.

---

## 🏗️ Monorepo Architecture

```text
nexmart/
├── apps/
│   ├── storefront/     # Next.js Customer Storefront (App Router + Tailwind CSS)
│   ├── admin/          # Next.js Admin & Inventory Management Portal
│   └── api/            # Node.js / Express + Prisma ORM Backend API
├── packages/
│   └── shared/         # Shared TypeScript types, utilities & validation schemas
├── docker-compose.yml  # Local database & service orchestration
└── turbo.json          # Turborepo pipeline configuration
```

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/waseemfullstack88-prog/nexmart.git
   cd nexmart
   ```

2. **Install dependencies & configure environment**
   ```bash
   npm install
   cp .env.example .env
   ```

3. **Start database & run development servers**
   ```bash
   docker compose up -d
   npm run dev
   ```
