# Plano — Nova Aba "ABOUT"

## 1. Objetivo

Adicionar uma sétima aba ao site (após Colours, Effects, Putty, Projects, Paint Recipes, Contacts), chamada **ABOUT**, com uma página de perfil pessoal estilizada como uma **datasheet do Warhammer 40K** — faixa de cabeçalho vermelha/dourada, blocos de estatísticas, secções com cabeçalhos em barra castanha, e rodapé com keywords.

**Diferença estrutural chave:** ao contrário das outras abas, esta página **não usa accordion**. Todo o conteúdo é visível de uma vez, sem collapse/expand.

---

## 2. Referência visual

Baseado na datasheet de "Trajann Valoris" (Adeptus Custodes):

- **Cabeçalho:** faixa horizontal vermelho-escuro/bordô com nome em destaque (branco, bold, caixa alta), com uma forma diagonal/recortada à direita e uma silhueta/imagem temática ao fundo do lado direito.
- **Bloco de stats:** logo abaixo do nome, uma fileira de caixas pequenas (estilo "M / T / SV / W / LD / OC") com letras e números grandes sobre fundo bege/pergaminho.
- **Corpo em duas colunas:** coluna esquerda mais larga com tabelas/listas (no original: armas), coluna direita mais estreita com texto corrido em blocos (no original: "Abilities").
- **Cabeçalhos de secção:** barra horizontal castanha/dourada com texto em caixa alta, separando os blocos de conteúdo.
- **Rodapé:** faixa inferior com "keywords" à esquerda, um ícone central, e "faction keywords" à direita.
- **Paleta:** vermelho-bordô, dourado/castanho, preto, fundo em tom pergaminho/cinza-claro.

A estrutura é reaproveitada como **layout/cores**, não como conteúdo literal — os textos e categorias são substituídos pelos dados pessoais abaixo.

---

## 3. Mapeamento de conteúdo → layout

| Elemento da datasheet | Conteúdo na aba About |
|---|---|
| Faixa de cabeçalho + nome | Nome do autor do site, em destaque |
| Bloco de stats (M/T/SV/W/LD/OC) | Dados rápidos pessoais: Idade · Nacionalidade · Residência · Profissão · Anos de Experiência · (uma 6ª métrica a definir) |
| Coluna esquerda (tabela de armas) | Tabela de **Skills/Habilidades** (ver secção 4) |
| Coluna direita (texto corrido "Abilities") | Texto **"About Me"** revisto (ver secção 5) |
| Cabeçalho de secção castanho | Usado para dividir "Skills", "About Me", "Interesses" |
| Bloco extra (tipo "Invulnerable Save") | Pode ser reaproveitado para um destaque tipo "Anos de Experiência: 26" ou similar, como "stat" especial |
| Rodapé com keywords | **Keywords pessoais** à esquerda (ex.: Developer, 3D Artist, Hobbyist, Scrum Master) e **Interesses** à direita, no lugar de "Faction Keywords" |

---

## 4. Conteúdo — Skills (substitui tabela de armas)

Formato tabular, à esquerda, como as "Ranged Weapons" / "Melee Weapons":

| Categoria | Skill |
|---|---|
| Desenvolvimento | Developer .NET |
| 3D Arts | Blender 3D |
| 3D Arts | Tinkercad |
| Fabricação | Impressão 3D |
| Gestão / Ensino | Scrum Master |
| Gestão / Ensino | Professor / Teacher |

*(Pode ser uma única tabela com 2 colunas "Área" / "Skill", ou duas mini-tabelas — a decidir na fase de construção.)*

---

## 5. Conteúdo — About Me (texto revisto)

> **About Me**
>
> Olá! Tenho 50 anos, sou brasileiro e atualmente vivo em Lisboa, Portugal. Sou desenvolvedor de software e consultor de TI há mais de 26 anos, e encontrei na pintura de miniaturas, dioramas e estética grimdark a fusão perfeita entre engenharia, precisão e criatividade.
>
> O que começou como paixão por impressão 3D e modelismo em escala evoluiu para uma busca constante pela cor perfeita, pelas texturas mais realistas e pelas melhores técnicas de pintura. Este site nasceu dessa paixão: a necessidade de organizar, planear e dominar a paleta de cores que dá vida aos mundos em miniatura, combinando a lógica do desenvolvimento de software com a arte do hobby.
>
> Aqui partilho o meu inventário pessoal de tintas, as minhas experiências com diferentes marcas (como Vallejo, AK Interactive e Citadel), e o progresso das minhas construções. Seja dando vida a um guerreiro sci-fi ou criando um terreno orgânico detalhado, o objetivo continua o mesmo: dominar as regras da cor para contar histórias visuais cativantes.

*(Texto final pode ser ajustado em tom/comprimento na fase de construção; este é o ponto de partida já com idade, nacionalidade e residência incluídos.)*

---

## 6. Conteúdo — Interesses (substitui "Faction Keywords")

- Pintura de miniaturas
- Pintura de elmos
- Construção de dioramas
- Construção de cenas tecnológicas com LEDs
- Modelagem 3D / Scratch-building (peças e terrenos personalizados)
- Conversões e kitbashing (misturar peças de kits diferentes)
- Fotografia de miniaturas (setup de luz, macro)
- Organização e gestão de coleção/inventário

*(Confirmado pelo utilizador — lista final fechada.)*

---

## 7. Stack e integração técnica

- **Tecnologia:** mesma do resto do site (HTML/CSS/JS existente — a confirmar detalhes exatos de framework/CSS na fase de construção, com ficheiro de outra aba como referência).
- **Sem accordion:** todo o conteúdo da aba fica visível imediatamente, sem necessidade de clicar para expandir secções.
- **Reuso de CSS:** cores, tipografia e variáveis já definidas no site devem ser reaproveitadas — só a aba About precisa de estilos novos específicos do layout "datasheet" (faixas, blocos de stats, bordas castanhas).
- **Responsividade:** o layout de 2 colunas (skills à esquerda, about+interesses à direita) deve colapsar para 1 coluna em mobile, tal como seria esperado nas datasheets oficiais digitais.

---

## 8. Estrutura de secções (ordem final proposta)

1. **Cabeçalho** — Nome + bloco de stats rápidos (idade, nacionalidade, residência, profissão, anos de experiência)
2. **Corpo (2 colunas)**
   - Esquerda: tabela de **Skills**
   - Direita: texto **About Me**
3. **Rodapé**
   - Esquerda: keywords pessoais (ex. Developer, 3D Artist, Hobbyist)
   - Direita: **Interesses** (lista da secção 6)
