# NEW FEATURE — PAINT RECIPES

## Paint Recipes Feature (In Development)

**Paint Recipes** is a new tab that aggregates painting tutorials with paint equivalencies across brands (Citadel, AK Interactive, Vallejo).

- **Data source**: `data/recipes.json` (tutorial-based paint schemes)
- **Voting system**: Supabase Realtime Database (like/dislike per equivalency)
- **Local cache**: localStorage for per-browser vote state
- **Reference**: See `toimprove/PAINT_RECIPES.md` for full specification

---

## Metadata
- **Feature Name:** Paint Recipes
- **Tab Label:** Paint Recipes
- **Status:** Launched
- **Launch Date:** 18 de Junho de 2026
- **Site:** https://codecraftandchronicles.github.io/cores/
- **Repositório:** https://github.com/codecraftandchronicles/cores
- **Data do documento:** 2026
- **Autor:** Bruno

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Motivação](#2-motivação)
3. [Estrutura da Página](#3-estrutura-da-página)
4. [Primeira Receita — Black Templars](#4-primeira-receita--black-templars)
5. [Schema JSON — colours.json (novo)](#5-schema-json--coloursjson-novo)
6. [Sistema de Equivalências](#6-sistema-de-equivalências)
7. [Sistema de Votos (Like / Dislike)](#7-sistema-de-votos-like--dislike)
8. [Supabase — Configuração](#8-supabase--configuração)
9. [Fontes e Referências](#9-fontes-e-referências)
10. [Roadmap de Implementação](#10-roadmap-de-implementação)
11. [Decisões de Arquitectura](#11-decisões-de-arquitectura)

---

## 1. Visão Geral

A secção **Paint Recipes** é uma nova aba do site que reúne esquemas de pintura para exércitos (40K, Age of Sigmar) e warbands (Underworlds), apresentando as tintas Citadel originais dos tutoriais e as suas equivalências em AK Interactive e Vallejo lado a lado.

O princípio fundamental desta secção é:

> **Aqui nada se cria. Toda a receita tem origem num tutorial existente na comunidade. A fonte é sempre citada e linkada.**

---

## 2. Motivação

A Citadel (Games Workshop) é a "língua franca" do hobby. A esmagadora maioria dos tutoriais no YouTube, blogs e livros de pintura utiliza tintas Citadel como referência ("aplique Nuln Oil", "basecoat com Abaddon Black"). 

Pintores que usam AK Interactive ou Vallejo — por preferência de frasco conta-gotas, consistência ou preço — precisam constantemente de consultar tabelas de equivalência em sites externos.

**Objetivo:** Se o site disser "Queres o efeito do Nuln Oil? Usa este da AK" — o valor utilitário do catálogo aumenta significativamente e resolve um problema real que os pintores já tentam resolver com ferramentas externas.

**Referências de mercado que fazem algo semelhante:**
- https://www.modelshade.com
- https://paintvault.com
- Reddit r/minipainting — perguntas frequentes sobre conversão de tintas

---

## 3. Estrutura da Página

### 3.1 Layout geral

```
[ TAB: Paint Recipes ]

┌─────────────────────────────────────────────────┐
│  🎨 Paint Recipes                               │
│  Esquemas de pintura baseados em tutoriais      │
│  da comunidade, com equivalências entre marcas. │
└─────────────────────────────────────────────────┘

[ Card: Black Templars ]   [ Card: ... ]   [ Card: ... ]
[ Warhammer 40K          ]
[ 12 tintas · Citadel    ]
[ + AK + Vallejo         ]
[ [ Ver Receita ]        ]
```

### 3.2 Cards de Army/Warband

Cada card apresenta:
- Nome do exército ou warband
- Sistema de jogo (Warhammer 40K / Age of Sigmar / Underworlds)
- Número de tintas na receita
- Marcas cobertas (Citadel + equivalentes)
- Botão "Ver Receita" que abre um accordion/modal

### 3.3 Vista de receita — Accordion

A receita abre num **accordion** (inspirado na estrutura de Projetos do site), organizado por etapas de pintura:

```
▼ Armadura Preta
   | Citadel              | AK Interactive         | Vallejo              | Match |
   | Corvus Black         | Black AK11029          | —                    |  95%  |  👍 12  👎 1
   | Basilicanum Grey     | —                      | German Grey 70.995   |  88%  |  👍 8   👎 2
   | Dark Reaper          | Dark Prussian Blue     | —                    |  82%  |  👍 5   👎 3

▼ Tabardo / Manto Branco
   ...

▼ Detalhes Dourados
   ...

▼ Metais
   ...
```

### 3.4 Nota de crédito (obrigatória em cada receita)

```
📖 Receita baseada no tutorial de Garfy em Tale of Painters
   https://taleofpainters.com/2021/10/tutorial-how-to-paint-black-templars-crusader-squads/
   As equivalências foram adicionadas pelo autor deste site.
   Match Score calculado por comparação HEX (Delta E) e fontes da comunidade.
```

---

## 4. Primeira Receita — Black Templars

**Fonte principal:** Tutorial de Garfy — Tale of Painters  
**URL:** https://taleofpainters.com/2021/10/tutorial-how-to-paint-black-templars-crusader-squads/  
**Sistema:** Warhammer 40K  
**Unidade de referência:** Crusader Squad

### 4.1 Tintas Citadel originais do tutorial (a confirmar via scraping)

| Etapa              | Tinta Citadel          | Fase      |
|--------------------|------------------------|-----------|
| Armadura           | Corvus Black           | Base      |
| Armadura           | Dark Reaper            | Layer     |
| Armadura           | Thunderhawk Blue       | Highlight |
| Armadura           | Basilicanum Grey       | Contrast  |
| Armadura           | Russ Grey              | Edge HL   |
| Tabardo branco     | Corax White            | Base      |
| Tabardo branco     | Screaming Skull        | Layer     |
| Tabardo branco     | Skeleton Horde         | Contrast  |
| Tabardo branco     | Wraithbone             | Highlight |
| Aquila (dourado)   | Liberator Gold         | Base      |
| Aquila (dourado)   | Aggaros Dunes          | Contrast  |
| Metais             | Leadbelcher            | Base      |
| Metais             | Basilicanum Grey       | Contrast  |
| Metais             | Runefang Steel         | Highlight |
| Olhos / Espada     | Yriel Yellow           | Base      |
| Olhos / Espada     | Iyanden Yellow         | Contrast  |
| Olhos / Espada     | Dorn Yellow            | Highlight |
| Cintos / Bolsas    | Mournfang Brown        | Base      |
| Cintos / Bolsas    | Cygor Brown            | Contrast  |
| Cintos / Bolsas    | Skrag Brown            | Layer     |

> ⚠️ **Nota:** Esta lista deve ser validada via scraping do tutorial original antes de publicar.  
> Fonte: https://taleofpainters.com/2021/10/tutorial-how-to-paint-black-templars-crusader-squads/

### 4.2 Equivalências a pesquisar

Para cada tinta Citadel acima, pesquisar equivalência em:

1. **Site oficial AK Interactive** — cada página de produto tem tabela de equivalências  
   Exemplo: `https://ak-interactive.com/product/[nome-da-tinta]/`  
   Campos disponíveis: Tamiya, Humbrol, Vallejo, Gunze, Revell, Citadel (quando disponível)

2. **Sites de conversão da comunidade:**
   - https://www.modelshade.com
   - https://paintvault.com

3. **Comparação por HEX / Delta E** (cálculo automático via script Python)

---

## 5. Schema JSON — colours.json (novo)

### 5.1 Estrutura completa de uma cor

```json
{
  "Base Colour": "DARK PRUSSIAN BLUE",
  "Code": "AK11189",
  "Hex": "#1A2A3A",
  "Manufacturer": "AK",
  "Temperature": "Cold",
  "Phase": "Base/Shadow",
  "Saturation": "Dark",
  "Primary Function": "...",
  "Strategic Use": "...",
  "Complementary": "CADMIUM RED",
  "Role of Complementary": "...",
  "Keywords": "...",
  "Owned": "True",
  "Equivalents": [
    {
      "Brand": "Citadel",
      "Name": "Dark Reaper",
      "Code": "CIT-XXXX",
      "Hex": "#2C3A42",
      "Color Match Score": 88,
      "Match Type": "Close Match",
      "Score Method": "DeltaE",
      "Source": "https://taleofpainters.com/2021/10/tutorial-how-to-paint-black-templars-crusader-squads/",
      "Community": {
        "Likes": 12,
        "Dislikes": 2
      }
    },
    {
      "Brand": "Vallejo",
      "Name": "Dark Prussian Blue",
      "Code": "70.965",
      "Hex": "#1B2B3B",
      "Color Match Score": 95,
      "Match Type": "Exact Match",
      "Score Method": "Community",
      "Source": "https://ak-interactive.com/product/dark-prussian-blue-standard/",
      "Community": {
        "Likes": 20,
        "Dislikes": 0
      }
    }
  ]
}
```

### 5.2 Valores permitidos por campo

**Match Type:**
| Valor | Score | Descrição |
|---|---|---|
| `"Exact Match"` | 95–100 | Equivalência indicada por múltiplas fontes ou Delta E < 2 |
| `"Close Match"` | 80–94 | Equivalência indicada por uma fonte ou Delta E < 5 |
| `"Approximate"` | 60–79 | Semelhança visual / Delta E < 10 |
| `"Distant"` | < 60 | Apenas referência, comportamento diferente esperado |

**Score Method:**
| Valor | Descrição |
|---|---|
| `"DeltaE"` | Calculado matematicamente por comparação CIELAB |
| `"Community"` | Baseado em tabelas de conversão existentes e fontes da comunidade |
| `"Hex"` | Calculado por distância RGB simples |
| `"Manual"` | Avaliado manualmente pelo autor |

**Source:** URL completo da fonte onde a equivalência foi encontrada. Obrigatório.

### 5.3 Nota sobre Color Match Score

> O `Color Match Score` representa apenas a semelhança de **cor** (tom, saturação, valor). Duas tintas podem ter o mesmo tom mas comportamentos distintos (cobertura, acabamento mate vs. acetinado, transparência, viscosidade). O campo `Match Type` nunca deve ser comunicado como equivalência perfeita.

---

## 6. Sistema de Equivalências

### 6.1 Fontes de dados (por prioridade)

1. **Site oficial AK Interactive** — tabela de equivalências por produto (fonte mais fidedigna para tintas AK)  
   URL padrão: `https://ak-interactive.com/product/[slug]/`

2. **PDF de conversão AK Interactive 2023** — mapeamento oficial AK → Citadel / Vallejo  
   A localizar: pesquisar "AK Interactive conversion chart 2023 PDF"

3. **Site oficial Vallejo** — tabela de equivalências Vallejo → Citadel  
   URL: https://acrylicosvallejo.com/en/conversion-chart/

4. **Modelshade** — conversor online community-driven  
   URL: https://www.modelshade.com

5. **PaintVault** — catálogo e equivalências  
   URL: https://paintvault.com

6. **Cálculo Delta E** — via script Python com HEX das tintas

### 6.2 Script Python — Plano de recolha de dados

```
FASE A — Black Templars (prioritário)
  A1. Scraping do tutorial Tale of Painters → lista de tintas Citadel
  A2. Para cada tinta Citadel:
      - Pesquisar equivalente AK no site AK Interactive
      - Pesquisar equivalente Vallejo no site Vallejo
      - Calcular Delta E por HEX quando disponível
  A3. Gerar JSON parcial com apenas as tintas da receita

FASE B — Expansão do catálogo
  B1. Para cada tinta AK já no colours.json:
      - Ir à página ak-interactive.com/product/[código]
      - Extrair tabela de equivalências
      - Popular array Equivalents
  B2. Repetir para tintas Vallejo
```

### 6.3 Fórmula Delta E simplificada (implementação inicial)

```python
import math

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def color_distance(hex1, hex2):
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    distance = math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)
    max_distance = math.sqrt(3 * 255**2)
    return round((1 - distance / max_distance) * 100, 1)

# Exemplo:
# color_distance("#1A3A1A", "#1B3B1B") → 99.2
```

> Para versão futura: implementar CIELAB (ΔE) com a biblioteca `colormath` (Python).

---

## 7. Sistema de Votos (Like / Dislike)

### 7.1 Comportamento dos botões

| Estado | LIKE | DISLIKE |
|---|---|---|
| Sem voto | ✅ Habilitado | ✅ Habilitado |
| Após clicar LIKE | 🔒 Inibido | ✅ Habilitado |
| Após clicar DISLIKE | ✅ Habilitado | 🔒 Inibido |

**Regras:**
- Clicar LIKE: soma +1 ao contador de Likes, inibe botão LIKE, mantém DISLIKE activo
- Clicar DISLIKE: soma +1 ao contador de Dislikes, inibe botão DISLIKE, mantém LIKE activo
- O utilizador pode mudar de opinião — mas não pode votar duas vezes no mesmo sentido
- Estado do voto guardado em **localStorage** (por browser/máquina)

### 7.2 Identificação do utilizador (localStorage)

```javascript
// Chave no localStorage por equivalência
// Formato: vote_{codigo_tinta}_{brand}
// Exemplo: vote_AK11029_Citadel

const VOTE_KEY = `vote_${tintaCode}_${brand}`;
const voteState = localStorage.getItem(VOTE_KEY);
// Valores: null | "like" | "dislike"
```

**Limitações conhecidas e aceites:**
- Limpar localStorage → utilizador pode votar novamente (aceitável para hobby site)
- Voto não persiste entre browsers diferentes na mesma máquina
- Não requer autenticação — deliberado para simplicidade

### 7.3 Estrutura de dados no Supabase

**Tabela: `paint_votes`**
```sql
CREATE TABLE paint_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paint_code VARCHAR(20) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  paint_name VARCHAR(255) NOT NULL,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(paint_code, brand, paint_name)
);
```

**Exemplo de dados:**
```json
{
  "id": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "paint_code": "AK11029",
  "brand": "Citadel",
  "paint_name": "Abaddon Black",
  "likes": 12,
  "dislikes": 2,
  "created_at": "2026-06-16T10:00:00+00:00",
  "updated_at": "2026-06-16T15:30:00+00:00"
}
```

### 7.4 Fluxo de voto

```
Utilizador clica LIKE
  → Verificar localStorage: já votou neste sentido?
      SE SIM → não fazer nada (botão já estava inibido)
      SE NÃO →
          → Incrementar contador no Supabase (+1 like)
          → Guardar estado no localStorage: "like"
          → Inibir botão LIKE
          → Manter botão DISLIKE activo
          → Actualizar contador visível na UI
```

### 7.5 Apresentação visual na tabela

```
| Citadel: Corvus Black  | AK: Black AK11029  | 95% · Exact Match |  👍 12   👎 1  |
```

---

## 8. Supabase — Configuração

### 8.1 Serviço escolhido

**Supabase Realtime Database (PostgreSQL)** — plataforma open-source baseada em PostgreSQL, gratuita no plano Free, Realtime Subscriptions nativa, autenticação integrada, e suporta Row Level Security (RLS).

**Motivo:** O site é estático (GitHub Pages). O JSON de cores não pode ser escrito pelo browser. Supabase oferece um backend robusto sem necessidade de servidor próprio, com API REST automática e suporte a eventos em tempo real via WebSocket.

### 8.2 Passos de configuração

```
1. Criar projecto em https://supabase.com/dashboard
2. No SQL Editor, criar tabela paint_votes:
   CREATE TABLE paint_votes (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     paint_code VARCHAR(20) NOT NULL,
     brand VARCHAR(50) NOT NULL,
     paint_name VARCHAR(255) NOT NULL,
     likes INT DEFAULT 0,
     dislikes INT DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(paint_code, brand, paint_name)
   );

3. Configurar políticas RLS (Row Level Security):
   ALTER TABLE paint_votes ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow public read" ON paint_votes FOR SELECT USING (true);
   CREATE POLICY "Allow public update likes/dislikes" ON paint_votes 
     FOR UPDATE USING (true) WITH CHECK (true);

4. Obter credenciais do projecto:
   - URL da API: Project Settings → API → Project URL
   - Chave anon: Project Settings → API → anon key
   - Adicionar ao ficheiro .env (git-ignored):
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=xxxxx

5. Adicionar ao site via CDN ou npm:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 8.3 Snippet de integração

```javascript
// Inicialização Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xxxxx.supabase.co';
const supabaseAnonKey = 'xxxxx';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Registar voto
async function registerVote(tintaCode, brand, paintName, voteType) {
  try {
    // Obter linha existente ou criar nova
    const { data, error } = await supabase
      .from('paint_votes')
      .upsert(
        {
          paint_code: tintaCode,
          brand: brand,
          paint_name: paintName,
          [voteType === 'like' ? 'likes' : 'dislikes']: 
            supabase.rpc('increment_counter', { 
              column: voteType === 'like' ? 'likes' : 'dislikes'
            })
        },
        { onConflict: 'paint_code,brand,paint_name' }
      );

    if (!error) {
      localStorage.setItem(`vote_${tintaCode}_${brand}`, voteType);
    }
  } catch (err) {
    console.error('Erro ao registar voto:', err);
  }
}

// Ler contadores (Subscribe para atualizações em tempo real)
function subscribeToVotes(tintaCode, brand, paintName, callback) {
  supabase
    .from('paint_votes')
    .on('*', payload => callback(payload.new))
    .eq('paint_code', tintaCode)
    .eq('brand', brand)
    .eq('paint_name', paintName)
    .subscribe();
}

// Obter dados actuais
async function getVotes(tintaCode, brand, paintName) {
  const { data, error } = await supabase
    .from('paint_votes')
    .select('likes, dislikes')
    .eq('paint_code', tintaCode)
    .eq('brand', brand)
    .eq('paint_name', paintName)
    .single();

  return data || { likes: 0, dislikes: 0 };
}
```

---

## 9. Fontes e Referências

> **Princípio:** Toda a informação neste site tem origem rastreável. Qualquer receita, equivalência ou dado técnico deve ter a sua fonte registada aqui e apresentada visivelmente ao utilizador.

### 9.1 Tutoriais de referência para receitas

| Army / Warband | Autor | Site | URL |
|---|---|---|---|
| Black Templars Crusader Squad | Garfy | Tale of Painters | https://taleofpainters.com/2021/10/tutorial-how-to-paint-black-templars-crusader-squads/ |
| *(a adicionar)* | | | |

### 9.2 Fontes de equivalências de tintas

| Fonte | Tipo | URL |
|---|---|---|
| AK Interactive (página de produto) | Oficial | https://ak-interactive.com |
| Vallejo (tabela de conversão) | Oficial | https://acrylicosvallejo.com/en/conversion-chart/ |
| Modelshade | Comunidade | https://www.modelshade.com |
| PaintVault | Comunidade | https://paintvault.com |
| Reddit r/minipainting | Comunidade | https://www.reddit.com/r/minipainting |
| PDF AK Interactive 2023 | Oficial AK | *(URL a confirmar via pesquisa)* |

### 9.3 Referências técnicas

| Tema | Referência |
|---|---|
| CIELAB / Delta E | https://en.wikipedia.org/wiki/Color_difference |
| Biblioteca Python colormath | https://python-colormath.readthedocs.io |
| Supabase Documentation | https://supabase.com/docs |
| Supabase Realtime | https://supabase.com/docs/guides/realtime |
| localStorage MDN | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |

---

## 10. Roadmap de Implementação

### FASE 1 — HTML / UI (sem dados reais)
- [ ] 1.1 Criar nova aba "Paint Recipes" no `index.html`
- [ ] 1.2 Criar card de army (layout com nome, sistema, nº tintas, botão)
- [ ] 1.3 Implementar accordion por etapas de pintura
- [ ] 1.4 Tabela com colunas: Citadel | AK | Vallejo | Match Score | Votos
- [ ] 1.5 Adicionar nota de crédito com link para fonte
- [ ] 1.6 Testar com dados estáticos (mock)

### FASE 2 — Dados (Python + JSON)
- [ ] 2.1 Script Python: scraping do tutorial Tale of Painters → lista de tintas Citadel
- [ ] 2.2 Script Python: pesquisa de equivalências AK no site AK Interactive
- [ ] 2.3 Script Python: pesquisa de equivalências Vallejo
- [ ] 2.4 Script Python: cálculo Delta E por HEX
- [ ] 2.5 Gerar JSON das tintas da receita Black Templars (novo schema)
- [ ] 2.6 Validar e integrar no `colours.json`

### FASE 3 — Sistema de votos
- [ ] 3.1 Criar projecto Supabase
- [ ] 3.2 Criar tabela `paint_votes` e configurar RLS
- [ ] 3.3 Integrar Supabase SDK no site
- [ ] 3.4 Implementar função `registerVote()`
- [ ] 3.5 Implementar função `subscribeToVotes()` (Realtime)
- [ ] 3.6 Implementar lógica localStorage (inibição de botões)
- [ ] 3.7 Actualizar UI com contadores em tempo real
- [ ] 3.8 Testar fluxo completo (voto → Supabase → UI)

### FASE 4 — Expansão
- [ ] 4.1 Adicionar receitas para outras fações / warbands
- [ ] 4.2 Implementar Delta E com CIELAB (biblioteca colormath)
- [ ] 4.3 Filtro "Estou a seguir um tutorial Citadel" (pesquisa por nome Citadel)
- [ ] 4.4 Página de conversão autónoma

---

## 11. Decisões de Arquitectura

| Decisão | Opção escolhida | Alternativa considerada | Motivo |
|---|---|---|---|
| Armazenamento de votos | Supabase Realtime Database | localStorage only / Firebase | PostgreSQL robusto, RLS, Realtime Subscriptions, open-source |
| Identificação do utilizador | localStorage | Cookies / Autenticação | Simplicidade; site de hobby sem login |
| Schema de equivalências | Array `Equivalents []` | Campo único `Citadel Equivalent` | Extensível para qualquer marca futura |
| Match Score | `Color Match Score` + `Match Type` | Equivalência binária (sim/não) | Honesto — evita promessas de equivalência perfeita |
| Score Method inicial | `"Community"` | `"DeltaE"` | Rapidez de implementação; evolui para DeltaE |
| Apresentação de receita | Accordion | Modal / Página separada | Consistência com padrão existente no site |
| Crédito de fonte | Obrigatório e visível | Rodapé discreto | Princípio do projecto: nada se cria sem fonte |
| Voto — mudança de opinião | Permitida (apenas inibe o lado votado) | Bloqueio total após primeiro voto | Mais justo; utilizador pode reconsiderar |

---

*Documento gerado como guia de implementação da feature Paint Recipes.*  
*Actualizar este ficheiro sempre que uma decisão de arquitectura ou fonte for adicionada ou alterada.*

- **Build**: None — no bundlers, transpilers, or framework scaffolding
- **Backend (Paint Recipes)**: Supabase Realtime Database (vote system)