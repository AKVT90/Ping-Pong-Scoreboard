# I18N_AUDIT.md — Placar Ping Pong PWA

Gerado em: 2026-10-18

## Estado Geral

| Língua | Chaves | Erros | Avisos |
|--------|--------|-------|--------|
| pt     | 769    | 0     | 0      |
| en     | 769    | 0     | 24 (termos partilhados) |
| es     | 769    | 0     | 70 (termos partilhados) |
| fr     | 769    | 0     | 250* |
| de     | 769    | 0     | 250* |
| zh     | 769    | 0     | 250* |
| ja     | 769    | 0     | 250* |

\* Os 250 avisos em fr/de/zh/ja são as perguntas do Quiz copiadas de `pt` (fallback intencional — ver nota abaixo).

## Cobertura por Categoria

### UI Estática (`data-i18n`)
- ✅ Todos os elementos em `index.html` têm atributos `data-i18n` ou `data-i18n-title` / `data-i18n-placeholder`
- ✅ `applyTranslations()` atualiza `html[lang]`, `textContent`, `title`, `placeholder`, `aria-label`
- ✅ HTML seguro: valores com `<br>/<strong>/<em>` usam `innerHTML` sanitizado; restantes usam `textContent`

### Conquistas (`ach.*`)
- ✅ 47 conquistas × 7 línguas = 329 pares name/desc traduzidos
- ✅ Toast e cards de conquista usam `t("ach."+id+".name")` com fallback para array PT
- ✅ Categorias internacionalizadas via `CAT_I18N` / `tCat()`

### Regras ITTF (`rules.*`)
- ✅ 9 secções × 7 línguas = 63 títulos traduzidos
- ✅ Regras individuais (r0–r9 por secção) traduzidas em todas as línguas
- ✅ `renderRulesScreen()` usa `t("rules."+sec.id+".title")` e `t("rules."+sec.id+".r"+i)`

### Quiz (`quiz.*`)
- ✅ 45 questões × 6 campos (q, o0, o1, o2, o3, exp) = 270 chaves
- ✅ pt, en, es têm traduções nativas
- ⚠️ fr, de, zh, ja usam fallback pt (quiz visível em português nestas línguas)
- ✅ Lógica de resposta correta nunca quebra: índice `a` é invariante, apenas texto muda

### Conteúdo Dinâmico
- ✅ Histórico de jogos: datas via `formatDate()` com `toLocaleString()` por língua
- ✅ Perfis de jogadores, ecrã de dados, toasts, overlays — todos usam `t()`
- ✅ Mini-jogos (tap, memória, quiz): textos de resultado e feedback traduzidos

## Troca de Língua em Tempo Real

`applyLang()` re-renderiza o ecrã ativo após trocar língua:
- `screen-players` → `renderPlayersList()`
- `screen-history` → `renderHistoryList()`
- `screen-achievements` → `renderAchievementsScreen()`
- `screen-rules-ittf` → `renderRulesScreen()`
- `screen-mg-quiz` → `resetQuizStart()`
- `screen-records`, `screen-data` → renderers respetivos

Estado do jogo/torneio/treino/timer **não é perdido** na troca — apenas os textos visuais são atualizados.

## Atributo `html[lang]`

`applyTranslations()` define `document.documentElement.lang` com valores BCP-47:

| Código | BCP-47     |
|--------|-----------|
| pt     | pt-PT     |
| en     | en        |
| es     | es        |
| fr     | fr        |
| de     | de        |
| zh     | zh-Hans   |
| ja     | ja        |

## Persistência

Língua guardada em `localStorage` com chave `pp-lang`. Restaurada no arranque via `t()` e `applyTranslations()`.

## Service Worker

Cache bumped para `placar-pingpong-v22` para invalidar versões anteriores após as alterações i18n.

## Ficheiros Verificados

| Ficheiro      | Estado |
|---------------|--------|
| app.js        | ✅ Modificado — i18n completo |
| index.html    | ✅ data-i18n em todos os elementos estáticos |
| manifest.json | ℹ️ Nome/descrição em PT (PWA manifest não suporta i18n dinâmico) |
| style.css     | ✅ Sem texto gerado por CSS (`content:`) |
| sw.js         | ✅ Cache v22 |

## Script de Validação

`check-i18n.js` — verifica:
1. Todas as línguas têm as mesmas chaves que `pt`
2. Nenhuma chave tem valor vazio
3. Valores idênticos ao `pt` (possível tradução em falta)
4. Cobertura de `ach.*`, `rules.*`, `quiz.*`

Uso: `node check-i18n.js`
