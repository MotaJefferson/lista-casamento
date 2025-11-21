# Guia de Configuração Local

Este guia explica como rodar o projeto de Lista de Casamento localmente.

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   - Verifique com: `node --version`
   - Baixe em: https://nodejs.org/

2. **pnpm** (gerenciador de pacotes)
   - Instale com: `npm install -g pnpm`
   - Ou use: `npm install -g pnpm`

3. **Conta no Supabase** (gratuita)
   - Crie em: https://supabase.com/

## Passo 1: Instalar Dependências

```bash
pnpm install
```

Ou se preferir usar npm:
```bash
npm install
```

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_do_supabase

# URL do site (obrigatório para pagamentos)
NEXT_PUBLIC_URL=http://localhost:3000

# Email SMTP (opcional - para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app
```

### Como obter as credenciais do Supabase:

1. Acesse https://supabase.com/ e crie um projeto
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (mantenha segura!)

## Passo 3: Configurar o Banco de Dados

Execute os scripts SQL no Supabase para criar as tabelas:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute os scripts na ordem:
   - `scripts/001-init-schema.sql` - Cria as tabelas
   - `scripts/002-seed-sample-gifts.sql` - Adiciona presentes de exemplo (opcional)
   - `scripts/003-seed-admin-user.sql` - Cria usuário admin (opcional)
   - `scripts/004-add-photos-column.sql` - Adiciona coluna de fotos (obrigatório)
   - `scripts/005-add-guest-name-and-config-fields.sql` - Adiciona campos adicionais (obrigatório)

### Ou execute via linha de comando:

```bash
# Criar usuário admin (se necessário)
# O script setup-admin precisa ser configurado conforme sua necessidade
```

**Nota:** O script de setup-admin usa as credenciais padrão:
- Username: `admin`
- Password: `wedding123`

## Passo 4: Configurar Storage no Supabase

Para o upload de imagens funcionar:

1. No Supabase Dashboard, vá em **Storage**
2. Clique em **New Bucket**
3. Configure o bucket:
   - **Name**: `gifts`
   - **Public bucket**: ✅ Marque esta opção (permite acesso público às imagens)
   - **File size limit**: 5 MB (ou conforme necessário)
   - **Allowed MIME types**: `image/*` (opcional, mas recomendado)
4. Clique em **Create bucket**

### Configurar Políticas de Acesso (RLS Policies)

Após criar o bucket, configure as políticas de acesso:

1. No bucket `gifts`, vá em **Policies**
2. Adicione uma política para **INSERT** (Upload):
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'gifts'::text) AND (auth.role() = 'authenticated'::text)
     ```
   - Ou para permitir uploads anônimos (menos seguro):
     ```sql
     bucket_id = 'gifts'::text
     ```

3. Adicione uma política para **SELECT** (Leitura):
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:
     ```sql
     bucket_id = 'gifts'::text
     ```

**Nota**: Se o bucket for público, a política de SELECT pode não ser necessária, mas é recomendada para maior controle.

## Passo 5: Adicionar Coluna de Fotos (Nova Funcionalidade)

Execute este SQL no Supabase para adicionar suporte a fotos na página principal:

```sql
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS main_page_photos JSONB DEFAULT '[]'::jsonb;
```

## Passo 6: Rodar o Projeto

```bash
pnpm dev
```

Ou com npm:
```bash
npm run dev
```

O projeto estará disponível em: **http://localhost:3000**

## Estrutura de URLs

- **Página Principal**: http://localhost:3000
- **Lista de Presentes**: http://localhost:3000/gifts
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Login Admin**: http://localhost:3000/admin/login

## Configuração Adicional

### MercadoPago (Para Pagamentos)

1. Crie uma conta em https://www.mercadopago.com.br/
2. Obtenha seu **Access Token** (teste ou produção)
3. No admin dashboard, vá em **Configurações**
4. Cole o token em **Token de Acesso MercadoPago**

### Email (Opcional)

Se quiser enviar emails de confirmação:

1. Para Gmail, crie uma "Senha de App":
   - Acesse: https://myaccount.google.com/apppasswords
   - Gere uma senha para "Mail"
   - Use essa senha em `SMTP_PASSWORD`

2. Para outros provedores, ajuste `SMTP_HOST` e `SMTP_PORT` conforme necessário

## Solução de Problemas

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe e está na raiz do projeto
- Confirme que todas as variáveis estão preenchidas

### Erro ao fazer upload de imagens

**Sintomas**: Erro 500 ao tentar fazer upload, mensagem "Bucket not found" ou "Permission denied"

**Soluções**:

1. **Verificar se o bucket existe**:
   - Acesse Supabase Dashboard > Storage
   - Confirme que existe um bucket chamado exatamente `gifts` (case-sensitive)

2. **Criar o bucket se não existir**:
   - Clique em **New Bucket**
   - Nome: `gifts`
   - Marque **Public bucket**
   - Clique em **Create bucket**

3. **Verificar políticas de acesso**:
   - No bucket `gifts`, vá em **Policies**
   - Deve haver pelo menos uma política para **INSERT** (upload)
   - Se não houver, crie conforme instruções no Passo 4

4. **Verificar variáveis de ambiente**:
   - Confirme que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretas
   - Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada (se necessário para uploads)

5. **Verificar logs do servidor**:
   - No terminal onde o servidor está rodando, procure por mensagens que começam com `[v0]`
   - Isso ajudará a identificar o erro específico

**Erro comum**: "The resource was not found"
- Isso geralmente significa que o bucket não existe ou o nome está incorreto
- Certifique-se de que o bucket se chama exatamente `gifts` (sem espaços, case-sensitive)

### Erro: "Failed to create payment preference"
- Verifique se o token do MercadoPago está configurado no admin
- Confirme que `NEXT_PUBLIC_URL` está correto

### Porta 3000 já em uso
```bash
# Use outra porta
pnpm dev -- -p 3001
```

## Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Rodar build de produção
pnpm start

# Verificar erros de lint
pnpm lint
```

## Próximos Passos

1. Configure o MercadoPago no admin dashboard
2. Adicione presentes através do admin
3. Configure as informações do casamento
4. Teste o fluxo de compra completo

---

**Dúvidas?** Verifique os logs no console do navegador (F12) e no terminal onde o servidor está rodando.

