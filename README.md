# Syros

Aplicativo de finanças pessoais mobile-first, construído como PWA para experiência nativa no iOS (Safari "Adicionar à Tela de Início") e Android.

**https://syrosfinance.netlify.app/**

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 |
| Build | Vite 7 |
| Estilo | Tailwind CSS (CDN) |
| Gráficos | Chart.js (CDN) |
| Fonte | Inter (Google Fonts) |
| Auth e DB | Supabase |
| Persistência | Supabase + localStorage fallback |

## Funcionalidades

- Registro de receitas e despesas com categorias personalizadas
- Dashboard com resumo financeiro, gráficos e metas
- Filtro por mês (com seletor de mês) ou período personalizado
- Transações recorrentes com projeções automáticas
- Parcelas com valor individual e total calculado
- Métodos de pagamento (Pix, Débito, Crédito, Dinheiro, Boleto)
- Tema claro/escuro
- Multilíngue (PT-BR, EN, ES, FR)
- Exportação de dados (CSV/JSON)
- Modelo freemium com recursos premium (envelopes, insights, cartões de crédito)
- Autenticação via Supabase
- Apps nativos iOS/Android via Capacitor

## Como rodar

```bash
npm install
npm run dev      # Dev server na porta 5173
npm run build    # Build de produção → /dist
npm run preview  # Preview do build
```

## Estrutura

```
src/
  App.jsx              # Estado global, rotas, navegação
  components/          # Componentes da interface
  services/            # storageService, supabase client
  utils/               # Cálculos financeiros
  i18n/                # Traduções (pt-BR, en, es, fr)
  data/                # Categorias
public/                # Ícones, PWA assets
docs/                  # Documentação (design system, arquitetura, features)
```
