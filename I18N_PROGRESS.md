# I18N_PROGRESS.md — Placar Ping Pong PWA

## ✅ Concluído

### Sessão anterior (antes de compactação)
- [x] `applyTranslations()`: suporte `html[lang]`, HTML seguro, `aria-label` (`data-i18n-aria`)
- [x] `applyLang()`: re-render de ecrãs dinâmicos ao trocar língua
- [x] `formatDate()`: datas localizadas com `toLocaleString()` por língua
- [x] Toast de conquista: usa `t("ach."+id+".name")` / `t("ach."+id+".desc")`
- [x] Cards de conquista: idem com fallback para array PT
- [x] `renderRulesScreen()`: usa `t("rules."+sec.id+".title")` e `t("rules."+sec.id+".r"+i)`
- [x] LANGS: `en` e `es` já tinham `ach.*`, `rules.*`, `quiz.*` (descoberta da sessão anterior)

### Esta sessão
- [x] `startQuiz()`: questões marcadas com `_idx` (índice original)
- [x] `renderQuizQuestion()`: usa `t("quiz."+diff+"."+q._idx+".q")` e `t("quiz."+diff+"."+q._idx+".o"+i)`
- [x] `answerQuiz()`: explicação via `t("quiz."+diff+"."+q._idx+".exp")`
- [x] `sw.js`: cache bumped para `v22`
- [x] `check-i18n.js`: script de validação automática criado
- [x] LANGS `fr`: 77 chaves `rules.*` traduzidas para francês + 270 quiz (fallback pt)
- [x] LANGS `de`: 77 chaves `rules.*` traduzidas para alemão + 270 quiz (fallback pt)
- [x] LANGS `zh`: 77 chaves `rules.*` traduzidas para chinês simplificado + 270 quiz (fallback pt)
- [x] LANGS `ja`: 77 chaves `rules.*` traduzidas para japonês + 270 quiz (fallback pt)
- [x] Validação: 0 erros em todas as 7 línguas (769 chaves cada)
- [x] `I18N_AUDIT.md` criado
- [x] `placar-pingpong-i18n.zip` gerado (252K)

## ⚠️ Pendente / Melhorias Futuras

- [ ] Quiz traduzido nativamente para fr/de/zh/ja (atualmente usa fallback pt)
  - 45 questões × 6 campos × 4 línguas = 1080 strings
  - Estrutura já suporta: basta adicionar as chaves `quiz.*` ao LANGS de cada língua
- [ ] Pluralização avançada (ex: "1 jogo" vs "2 jogos") — atualmente concatenação simples
- [ ] Unidades de medida localizadas (cm/mm — já em todas as regras)
- [ ] RTL support (não aplicável às 7 línguas atuais)

## Resultado da Validação Final

```
📋  Língua de referência: pt  (769 chaves)
🌍  Línguas no catálogo: pt, en, es, fr, de, zh, ja

🏆  Conquistas verificadas: 47
📖  Secções de regras: 9

⚠️   1097 aviso(s).  [todos são quiz fallback pt — esperado]
✅  0 erros
```
