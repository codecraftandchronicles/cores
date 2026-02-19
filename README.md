# Cadastro de Cores e Efeitos

Uma aplicação web estática simples para consultar um cadastro de cores e seus efeitos/utilizações estratégicas. Perfeita para pintores, artistas e entusiastas de pintura de miniaturas.

## Características

- **Pesquisa flexível**: Procure por qualquer termo em todos os campos ou num campo específico
- **Duas abas**: Consulte cores ou efeitos separadamente
- **Interface responsiva**: Funciona perfeitamente em desktop, tablet e mobile
- **Sem dependências**: Aplicação 100% estática, sem necessidade de servidor
- **GitHub Pages ready**: Faça deploy direto no GitHub Pages

## Estrutura de ficheiros

```
cadastro-cores-app/
├── index.html           # Página principal
├── css/
│   └── style.css        # Estilos da aplicação
├── js/
│   └── app.js           # Lógica da aplicação
├── data/
│   └── cores-efeitos.json  # Base de dados em JSON
└── README.md            # Este ficheiro
```

## Como usar localmente

1. Abra o ficheiro `index.html` diretamente no seu navegador
2. Ou use um servidor local simples:

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js
npx http-server

# Com PHP
php -S localhost:8000
```

Depois aceda a `http://localhost:8000`

## Deploy no GitHub Pages

### Opção 1: Usando um repositório existente

1. Clone ou aceda ao seu repositório GitHub
2. Copie todos os ficheiros desta aplicação para a raiz do repositório
3. Faça commit e push:
   ```bash
   git add .
   git commit -m "Adicionar aplicação de cadastro de cores"
   git push origin main
   ```
4. Vá para **Settings > Pages** do seu repositório
5. Em "Source", selecione "Deploy from a branch"
6. Escolha a branch `main` e pasta `/ (root)`
7. Clique em "Save"
8. A sua aplicação estará disponível em `https://seu-username.github.io/seu-repositorio`

### Opção 2: Criar um novo repositório

1. Crie um novo repositório no GitHub chamado `seu-username.github.io`
2. Clone o repositório:
   ```bash
   git clone https://github.com/seu-username/seu-username.github.io
   cd seu-username.github.io
   ```
3. Copie todos os ficheiros desta aplicação para o directório
4. Faça commit e push:
   ```bash
   git add .
   git commit -m "Adicionar aplicação de cadastro de cores"
   git push origin main
   ```
5. A sua aplicação estará disponível em `https://seu-username.github.io`

## Estrutura dos dados

### Cores

Cada cor contém as seguintes informações:

- **Cor Base**: Nome da cor
- **Código**: Código do produto (ex: AK11092)
- **Temperatura**: Quente, Frio ou Neutra
- **Fase**: Base, Sombra, Realce, Filtro ou Efeito Especial
- **Nível de saturação**: Claro, Médio ou Escuro
- **Função Principal**: Descrição da função principal da cor
- **Uso Estratégico**: Técnicas e aplicações recomendadas
- **Complementar**: Cor complementar recomendada
- **Papel do Complementar**: Descrição do papel da cor complementar

### Efeitos

Cada efeito contém:

- **Nome**: Nome do efeito
- **Código**: Código do produto
- **Função**: Descrição detalhada do efeito

## Funcionalidades

### Pesquisa

- **Pesquisa global**: Procure por qualquer termo em todos os campos
- **Pesquisa por campo**: Selecione um campo específico para pesquisar apenas nele
- **Pesquisa em tempo real**: Pressione Enter ou clique no botão "Pesquisar"

### Navegação

- **Abas**: Alterne entre "Cores" e "Efeitos"
- **Limpeza**: Clique em "Limpar" para resetar a pesquisa
- **Responsividade**: A aplicação adapta-se a qualquer tamanho de ecrã

## Personalização

### Modificar estilos

Edite o ficheiro `css/style.css` para alterar cores, fontes ou layout.

### Adicionar mais dados

1. Edite o ficheiro `data/cores-efeitos.json`
2. Mantenha a estrutura JSON válida
3. Recarregue a página no navegador

### Alterar o título ou descrição

Edite o ficheiro `index.html` e procure pelas tags `<h1>` e `<p>` no `<header>`.

## Compatibilidade

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Licença

Esta aplicação é fornecida como está, sem garantias. Sinta-se livre para usar, modificar e distribuir.

## Suporte

Para dúvidas ou sugestões, consulte a documentação do GitHub Pages:
https://docs.github.com/en/pages

---

**Desenvolvido com ❤️ para facilitar a consulta de cores e efeitos**
