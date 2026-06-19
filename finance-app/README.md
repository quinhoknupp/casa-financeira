# Casa Financeira

App PWA para controle financeiro do casal, com backend serverless preparado para Pluggy/Open Finance e Supabase.

## Caminho Mais Simples Para Publicar

Se você precisa começar com contas gratuitas, leia primeiro `GUIA-CONTAS-GRATUITAS.md`.

### 1. Criar Supabase

1. Entre em https://supabase.com.
2. Crie um projeto.
3. Abra o editor SQL.
4. Cole e execute o conteúdo de `supabase-schema.sql`.
5. Copie:
   - Project URL
   - service_role key

### 2. Criar Pluggy

1. Entre em https://dashboard.pluggy.ai.
2. Crie uma aplicação.
3. Copie:
   - CLIENT_ID
   - CLIENT_SECRET

### 3. Publicar Na Vercel

1. Crie uma conta em https://vercel.com.
2. Crie um projeto usando esta pasta.
3. Em Environment Variables, configure:
   - `PLUGGY_CLIENT_ID`
   - `PLUGGY_CLIENT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_BASE_URL`
4. Publique.

### 4. Testar

Abra:

`https://sua-url.vercel.app/api/health`

Se `configured` for `true`, o backend está com chaves configuradas.

## O Que Já Está Pronto

- frontend PWA
- endpoint `/api/health`
- endpoint `/api/token` para Connect Token da Pluggy
- endpoint `/api/connection` para gravar conexão no Supabase
- endpoint `/api/sync` para importar contas/transações a partir de um `itemId`
- endpoint `/api/webhook` para receber eventos da Pluggy
- schema SQL do Supabase

## Segurança

Nunca coloque senha de banco no frontend.

As chaves Pluggy e Supabase ficam somente nas variáveis de ambiente da Vercel.
