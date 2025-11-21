# Wedding Registry Website

Sistema completo de lista de presentes para casamento com integração ao MercadoPago.

## 🚀 Início Rápido

Para rodar o projeto localmente, consulte o guia completo: **[SETUP_LOCAL.md](./SETUP_LOCAL.md)**

### Resumo Rápido:

1. **Instale as dependências:**
   ```bash
   pnpm install
   ```

2. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env.local`
   - Preencha com suas credenciais do Supabase

3. **Configure o banco de dados:**
   - Execute os scripts SQL no Supabase (veja `scripts/`)

4. **Rode o projeto:**
   ```bash
   pnpm dev
   ```

## 📋 Funcionalidades

- ✅ Lista de presentes com múltiplas compras permitidas
- ✅ Upload de imagens para presentes
- ✅ Integração com MercadoPago para pagamentos
- ✅ Dashboard administrativo completo
- ✅ Galeria de fotos na página principal
- ✅ Sistema de autenticação para convidados (OTP)
- ✅ Rastreamento de compras e status de pagamento

## 📁 Estrutura do Projeto

```
├── app/                    # Rotas Next.js (App Router)
│   ├── api/               # API Routes
│   ├── admin/             # Páginas administrativas
│   ├── gifts/             # Página de presentes
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── admin/             # Componentes do admin
│   ├── gifts/             # Componentes de presentes
│   └── ui/                # Componentes UI reutilizáveis
├── lib/                   # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   └── types/             # Tipos TypeScript
└── scripts/              # Scripts SQL e utilitários
```

## 🔧 Tecnologias

- **Next.js 16** - Framework React
- **Supabase** - Banco de dados e autenticação
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **MercadoPago** - Gateway de pagamento
- **Radix UI** - Componentes acessíveis

## 📚 Documentação Adicional

- [Guia de Setup Local](./SETUP_LOCAL.md) - Instruções detalhadas
- [Integração de Pagamento](./PAYMENT_INTEGRATION.md) - Documentação do MercadoPago

## 🐛 Solução de Problemas

Consulte a seção "Solução de Problemas" no [SETUP_LOCAL.md](./SETUP_LOCAL.md)

---

*Projeto desenvolvido com [v0.app](https://v0.app)*