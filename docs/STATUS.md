# Syros — Status & Pending Work

Live status of the mobile + billing rollout. Update this file as things progress so any Claude session (on any machine) picks up where the last one stopped. Paired with [MOBILE_SETUP.md](../MOBILE_SETUP.md) (the full external-setup playbook) and the plan in [CLAUDE.md](../CLAUDE.md).

Last updated: **2026-07-21**

---

## Roadmap phases

| Fase | Status | Notas |
|---|---|---|
| 1 — Capacitor setup | ✅ Código pronto | Falta rodar em simulador iOS (precisa Mac) |
| 2 — Paywall UI | ✅ Completo | `PaywallModal` renderiza, tiers, trial, i18n |
| 3 — Backend (migration + `isPremiumActive`) | ✅ Validado em prod | Migration `20260412_premium_subscription_fields.sql` aplicada |
| 4 — RevenueCat + IAP | ⚠️ Código commitado, nunca testado | Bloqueado por contas de loja (ver abaixo) |
| 5 — Stripe Checkout web | ✅ Testado end-to-end em **sandbox** | Subir para live mode é o próximo passo (ver checklist) |
| 6 — Webhook unificado (`billing-webhook`) | ✅ Deployado e validado | Compra + cancelamento testados, `user_preferences` atualiza corretamente |
| 7 — Submissão às lojas | ❌ Não iniciado | Ver [MOBILE_SETUP.md](../MOBILE_SETUP.md) |
| 8 — Pós-launch | ❌ Aguarda Fase 7 | Monitoramento, A/B de preço, churn |

---

## Contas de loja

### Google Play Console
- **Status:** Pago e conta criada em 2026-04-12. **Aguardando validação do Google** (pode levar até 48h, às vezes dias).
- **Bloqueia:** upload do primeiro AAB, criação dos produtos IAP (`syros_premium_monthly`, `syros_premium_annual`), testes em internal testing track.
- **Próximo passo quando aprovar:** seguir [MOBILE_SETUP.md](../MOBILE_SETUP.md) seção "Google Play Console" — criar app, upload AAB, registrar produtos, colar IDs no RevenueCat.

### Apple Developer
- **Status:** Não iniciado.
- **Custo:** US$ 99/ano.
- **Bloqueia:** toda a submissão iOS (Fase 7 iOS) e testes sandbox IAP iOS (Fase 4 iOS).
- **Requer também:** Mac com Xcode para Archive/Upload. Sem isso, não há caminho para TestFlight nem App Store.

---

## Stripe live mode — checklist pendente

Todo o fluxo web (Stripe Checkout → `billing-webhook` → `user_preferences`) está **100% funcional e validado em sandbox**. Compra e cancelamento já foram testados end-to-end; webhook atualiza `plan`, `premium_expires_at`, `plan_source='web'`, `plan_provider_id` corretamente.

Para subir para **live mode** e começar a cobrar de verdade na web (movimento de menor esforço e maior retorno — libera receita antes mesmo das lojas aprovarem):

1. **Criar os 2 Products em Stripe live mode**
   - `Syros Mensal` → Price recorrente R$ 12,90/mês (BRL)
   - `Syros Anual` → Price recorrente R$ 99,90/ano (BRL)
   - Habilitar Pix e boleto em Payment Methods
   - Anotar os novos `price_id` (serão diferentes dos de sandbox)

2. **Atualizar secrets do Supabase**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...   # gerado no passo 3
   ```
   Os price IDs hardcoded em `supabase/functions/create-checkout-session/index.ts` também precisam apontar para os novos `price_id` live.

3. **Recriar webhook endpoint em Stripe live**
   - Stripe Dashboard (live) → Developers → Webhooks → Add endpoint
   - URL: `https://<project>.supabase.co/functions/v1/billing-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copiar o `whsec_...` gerado e colocar na secret do passo 2

4. **Redeploy das edge functions**
   ```bash
   supabase functions deploy create-checkout-session --no-verify-jwt
   supabase functions deploy billing-webhook --no-verify-jwt
   ```

5. **Smoke test com cartão real** (R$ 0,01 ou compra pequena) antes de divulgar — confirmar que `user_preferences` atualiza, UI reflete premium, e o cancelamento reverte para free.

---

## Última auditoria de código (2026-07-21)

Correções aplicadas na sessão de auditoria completa do app:

### Bugs críticos corrigidos
- **calculateTotals**: income e paidExpense agora excluem projeções (`isProjection`). SummaryCards mostrava valores inflados.
- **calculateExpensesByCategory**: exclui projeções — categorias mostravam valores irreais.
- **calculateCardSummary**: exclui projeções — fatura do cartão inflava.
- **compareCurrentVsPreviousMonth**: exclui projeções, aceita refMonth/refYear.
- **TransactionForm**: data monthly agora respeita a data escolhida pelo usuário (antes usava `new Date()`).
- **getUpcomingBills**: exclui income (não são bills), normaliza horas para não perder vencimentos do dia.

### Feedback do cliente aplicado
- **Ciclo removido**: botão "Ciclo" removido da FilterBar, opção removida do Settings. Tratado como fallback silencioso no código.
- **Projeção invisível**: removido badge "Projeção" do UpcomingBillsSection, removida borda visual do CSS. Apenas opacity: 0.6 diferencia.
- **Parcelas UX**: helper text agora diz "Informe quanto custa cada parcela" e mostra "Total: R$ X (Nx de R$ Y)".
- **Troca de mês Overview**: corrigido — cycle tratado como month, overview muda corretamente.

### Melhorias de consistência
- **Boleto**: adicionado em PaymentTabs, TransactionList (paymentLabels), PaymentModal.
- **Pluralização**: "transações encontradas" (era "transaçãoões").
- **InsightsSection**: agora recebe envelopes com status calculado (antes recebia raw sem percent/status).
- **EnvelopesSection**: `calculateEnvelopeStatus` aceita refMonth/refYear para flexibilidade.

### Arquivos modificados
```
src/utils/calculations.js
src/App.jsx
src/components/TransactionForm.jsx
src/components/FilterBar.jsx
src/components/TransactionList.jsx
src/components/PaymentTabs.jsx
src/components/PaymentModal.jsx
src/components/UpcomingBillsSection.jsx
src/components/SettingsSection.jsx
src/index.css
```

---

## Bloqueios reais (ordem de prioridade)

1. **Stripe live mode** — único bloqueio removível sem esperar terceiros. Prioridade #1.
2. **Google Play** — aguardando validação deles; nada a fazer até lá.
3. **Mac + Apple Developer** — sem Mac não há caminho iOS. Decidir se vale alugar um Mac na nuvem (MacStadium) ou esperar ter hardware.

---

## Arquivos-chave do pipeline de billing

| Arquivo | Papel |
|---|---|
| [src/paywall/packages.js](../src/paywall/packages.js) | SKUs e preços (web + IAP) — fonte única |
| [src/services/checkout.js](../src/services/checkout.js) | Client Stripe Checkout |
| [src/services/purchases.js](../src/services/purchases.js) | Wrapper RevenueCat |
| [src/utils/platform.js](../src/utils/platform.js) | `isNativeApp()` — decide web vs IAP |
| [src/components/PaywallModal.jsx](../src/components/PaywallModal.jsx) | UI do paywall |
| [src/config.js](../src/config.js) | `isPremiumActive(prefs)` |
| `supabase/functions/create-checkout-session/index.ts` | Edge function Stripe Checkout |
| `supabase/functions/billing-webhook/index.ts` | Webhook unificado — **source of truth** |
| `supabase/migrations/20260412_premium_subscription_fields.sql` | Schema das colunas de plano |
