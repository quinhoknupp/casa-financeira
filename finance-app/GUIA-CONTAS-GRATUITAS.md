# Guia Com Contas Gratuitas

Este é o caminho para colocar o app online gastando R$ 0 no começo.

## Contas Para Criar

### 1. GitHub

Site: https://github.com

Uso:
- guardar os arquivos do app
- conectar com a Vercel

Plano:
- gratuito

### 2. Vercel

Site: https://vercel.com

Uso:
- deixar o app online com HTTPS
- rodar os endpoints em `/api`

Plano:
- Hobby gratuito para projeto pessoal

### 3. Supabase

Site: https://supabase.com

Uso:
- banco de dados
- depois pode receber login de João e esposa

Plano:
- Free para começar

Observação:
- projetos gratuitos podem ter limites e pausas por inatividade.

### 4. Pluggy

Site: https://dashboard.pluggy.ai

Uso:
- conexão bancária por Open Finance
- gerar token seguro para conectar bancos

Plano:
- use sandbox/teste se disponível
- produção com bancos reais pode exigir plano comercial ou aprovação

## Caminho 100% Grátis Agora

1. Publicar o app na Vercel.
2. Criar Supabase Free.
3. Rodar `supabase-schema.sql`.
4. Usar o app em modo demonstração ou importação manual.
5. Deixar Pluggy para quando quiser conexão real com bancos.

## Caminho Com Banco Real

1. Criar Pluggy.
2. Pegar `CLIENT_ID` e `CLIENT_SECRET`.
3. Colar essas chaves na Vercel.
4. Conectar bancos pelo app.

Se a Pluggy exigir plano pago para produção, a alternativa gratuita é importar arquivos CSV/OFX dos bancos.

## Variáveis Na Vercel

Configure estas variáveis quando tiver:

```txt
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
APP_BASE_URL=
```

Para começar grátis sem Pluggy, configure só Supabase e Vercel. O app continua online, mas sem sincronização bancária automática real.
