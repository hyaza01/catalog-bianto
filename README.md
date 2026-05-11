# Bianto Catalog V2

Monorepo full stack para o novo catalogo digital da Bianto Store, focado em geracao de leads.

## Stack

- Frontend: Next.js App Router, React, TypeScript strict, Tailwind CSS, Framer Motion, React Hook Form, Zod.
- Backend: NestJS, TypeScript strict, Prisma ORM, PostgreSQL, JWT com refresh token em cookie HttpOnly.
- Infra local: Docker Compose com Postgres, API, Web e Prisma Studio.

## Estrutura

```txt
bianto-catalog-v2/
├── apps/
│   ├── web/   # Next.js
│   └── api/   # NestJS
├── packages/
│   ├── config/
│   └── types/
├── docker-compose.yml
├── .env.example
└── package.json
```

## Setup local (sem Docker)

1. Instale dependencias:

```bash
npm run setup
```

2. Copie os envs:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Suba Postgres (local ou docker).

4. Gere client Prisma, rode migration e seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Rode web + api:

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/api/docs

## Setup com Docker Compose

```bash
docker compose up --build
```

Servicos:

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- Postgres: localhost:5432
- Prisma Studio: http://localhost:5555

## Scripts principais

Na raiz:

- `npm run dev`: sobe web e api em paralelo.
- `npm run build`: build de web e api.
- `npm run lint`: lint de web e api.
- `npm run db:migrate`: migrate Prisma da API.
- `npm run db:seed`: seed Prisma da API.
- `npm run db:studio`: Prisma Studio da API.

## Credenciais seed

No seed da API:

- Nome: `ADMIN_SEED_NAME`
- E-mail: `ADMIN_SEED_EMAIL`
- Senha: `ADMIN_SEED_PASSWORD`

Defina esses valores em `apps/api/.env` antes de executar o seed.

## Entregas da V1 nesta base

- Catalogo publico com Home, Catalogo, Categoria, Produto, Contato e Obrigado.
- Captura de lead publica com validacao no frontend e backend.
- CTA WhatsApp com mensagem pre-formatada.
- API REST publica/admin com prefixo `/api/v1`.
- Auth admin com login/logout/refresh/me via cookie HttpOnly.
- CRUD inicial admin de produtos, categorias, leads e configuracoes.
- Dashboard admin com resumo basico.
- Prisma schema completo com migration inicial e seed.
- Sitemap, robots e metadata SEO base.

## Observacoes

- O projeto atual e uma nova base (não reaproveita arquitetura Vite anterior).
- A migration inicial inclui extensoes `unaccent` e `pg_trgm` para busca evolutiva.
- Alguns fluxos avancados (ex.: todos os testes E2E e refinamentos de UX admin) podem ser expandidos nas proximas iteracoes.
