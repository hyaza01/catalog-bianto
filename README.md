# Bianto Store - Catalogo

MVP estatico em React + Vite + TypeScript, organizado para futura migracao para backend real.

## Rodar o projeto

1. Instale dependencias:
   npm install
2. Configure ambiente:
   - copie .env.example para .env
   - ajuste VITE_WHATSAPP_NUMBER
3. Desenvolvimento:
   npm run dev
4. Build:
   npm run build
5. Preview do build:
   npm run preview

Importante: nao abra index.html com file://. Use sempre o servidor do Vite.

## Seguranca de variaveis de ambiente

- Nunca commite arquivos `.env`, `.env.production` ou similares.
- Use apenas `.env.example` como modelo publico.
- No GitHub Pages (Actions), configure estes secrets do repositorio:
   - `VITE_WHATSAPP_NUMBER`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_ADMIN_EMAILS`
   - `VITE_CONFIG_INVALIDATION_WEBHOOK_URL`
- Se qualquer chave vazar, revogue no provedor e gere uma nova imediatamente.

## Estrutura de dados (falsa API)

O catalogo foi dividido por dominio para facilitar manutencao:

- src/data/categories/canecas.ts
- src/data/categories/garrafas-termicas.ts
- src/data/categories/copos.ts
- src/data/categories/kits.ts
- src/data/categories/outros.ts
- src/data/index.ts

src/data/index.ts agrega tudo e exporta uma fonte unica:

- catalog
- PRODUCTS (alias de compatibilidade)
- PRICE_RANGE
- ALL_TAGS
- PRODUCTS_BY_ID
- FEATURED_PRODUCTS

## Contrato de produto (pronto para backend)

Tipagem principal em src/types/product.ts:

- Category
- Product
- ProductDescription
- ProductFlags
- ProductVariants

Formato atual do Product:

```ts
interface Product {
  id: string
  name: string
  description: {
    short: string
    long: string
  }
  category: Category
  price: number
  minQuantity: number
  images: string[]
  tags: string[]
  flags: {
    isAvailable: boolean
    isFeatured: boolean
    isCustomizable: boolean
  }
  variants?: {
    sizes?: string[]
    colors?: string[]
  }
}
```

## Anexos de imagem (estrategia atual)

Nao salvamos fotos de produto no repositorio.
As imagens sao URLs externas (Cloudinary), no campo images.

URL padrao usada nos exemplos atuais:

https://res.cloudinary.com/dru1rkklk/image/upload/q_auto/f_auto/v1776291490/Gemini_Generated_Image_b6izwhb6izwhb6iz_1_grc7dl.png

Para anexar/alterar imagem de um produto:

1. Faça upload da imagem no Cloudinary
2. Copie a URL final
3. Abra a categoria correta em src/data/categories/
4. Atualize o campo images do produto

Exemplo:

```ts
images: ['https://res.cloudinary.com/.../minha-imagem.png']
```

## Como adicionar um novo produto

1. Escolha o arquivo de categoria em src/data/categories/
2. Adicione um novo objeto Product no array da categoria
3. Use id unico (preferencia: UUID)
4. Informe description, price, minQuantity, flags e images
5. Rode npm run dev para validar na UI
6. Rode npm run build antes do deploy

## Hook assíncrono para preparar V2

O app nao consome o catalogo diretamente nos componentes principais.
Ele usa src/hooks/useCatalog.ts para simular latencia e preparar troca por API real.

Na V2, a migracao principal sera trocar a carga local por fetch no proprio hook.

## Anexos gerais (PDFs, tabelas, etc)

Para arquivos estaticos nao relacionados a imagens de produto:

1. Crie public/anexos
2. Coloque os arquivos nessa pasta
3. Acesse por /anexos/nome-do-arquivo.pdf

## Checklist antes de deploy

1. npm run dev
2. Testar Home e Catalogo
3. Testar modal de produto e selecao
4. Testar PDF e WhatsApp
5. npm run build

## Cache e sincronizacao de configuracoes

As configuracoes globais (site_settings) precisam refletir rapidamente em desktop e mobile.

Este projeto ja aplica no client:

- revalidacao automatica com React Query (focus, mount e transicao de rota)
- invalidacao por evento realtime do Supabase
- requests sem cache no navegador para consultas ao Supabase
- limpeza de Service Worker legado e caches antigos na inicializacao

Configuracao recomendada em infraestrutura (CDN/proxy):

1. Nao aplicar Cache First em respostas da API de configuracoes (site_settings)
2. Para endpoints de configuracao, usar cache policy equivalente a no-store/no-cache
3. Evitar variacao de cache por User-Agent para a mesma rota da API
4. Se houver Service Worker externo, configurar Network First ou Stale-While-Revalidate para dados dinamicos

Passos adicionais para ambiente real:

1. Execute tambem o SQL em supabase/policies/site_settings_rpc.sql para habilitar a RPC get_site_settings (leitura por POST, com menor risco de cache intermediario)
2. Opcional: configure VITE_CONFIG_INVALIDATION_WEBHOOK_URL para chamar um endpoint de purge/revalidate da sua infraestrutura sempre que o Admin salvar configuracoes
3. No endpoint de webhook, invalide ao menos as rotas /, /catalogo, /sobre e /index.html
4. Se estiver usando Cloudflare/CloudFront, remova Vary por User-Agent para rotas de configuracao global e unifique a chave de cache

