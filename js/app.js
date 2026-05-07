
let allDataColours = { cores: []};
let allDataEffects = { efeitos: [] };
let currentTab = 'cores';
let language = 'PT'; 
let isPT = true;
const fieldsToIgnore = ['Hex', 'Papel do Complementar', 'Complementar', 'Temperatura','Fase','Nível de Saturação', 'Fabricante'];
const fieldsToIgnoreEN = ['Hex', 'Role of Complementary', 'Complementary', 'Temperature','Phase','Saturation Level', 'Manufacturer'];
let colorMap = {};
let sortAsc = true;
let currentFilteredResults = []; 
let searchField = "", noResults = "", showing = "", illustrative = "", noResultsContainer = "", resultsLabel = "", headerLabel = "", headerParagraph = "";
const configFiltros = {
    'PT': {
        'Temperatura': ['Quente', 'Frio', 'Neutra'],
        'Fase': ['Base', 'Sombra', 'Realce', 'Filtro', 'Fluorescente', 'TMM'],
        'Saturação': ['Claro', 'Médio', 'Escuro'],
        'Fabricante': ['AK', 'Citadel', 'Vallejo']
    },
    'EN': {
        'Temperature': ['Warm', 'Cold', 'Neutral'],
        'Phase': ['Base', 'Shadow', 'Highlight', 'Filter', 'Fluorescent', 'TMM'],
        'Saturation': ['Light', 'Medium', 'Dark'],
        'Manufacturer': ['AK', 'Citadel', 'Vallejo']
    }
};
const uiTranslations = {
    'PT': {
        tabCores: 'Cores',
        tabEfeitos: 'Efeitos',
        tabMassa: 'Massa',
        searchPlaceholder: 'Digite um termo...',
        searchField: 'Selecionar um filtro...',
        noResults: 'Nenhum resultado encontrado',
        noResultsContainer: 'Tente ajustar os critérios de pesquisa',
        tryAgain: 'LIMPAR',
        showing: 'A exibir',
        illustrative: 'Mera ilustração visual',
        searchInputLabel: 'Pesquisar',
        searchFieldLabel: 'Filtro',
        resultsLabel: 'resultados',
        headerLabel: 'Cadastro de Cores e Efeitos',
        headerParagraph: 'Guia de consulta rápida para tintas, texturas e técnicas de pintura',
        disclaimerTitle: 'Aviso Legal',
        disclaimerText: 'Esta aplicação é um projeto pessoal e não tem afiliação oficial com marcas ou produtos. As informações apresentadas são baseadas em pesquisas e podem conter imprecisões. Use como referência, mas verifique sempre com fontes oficiais.',
        footerCopyright: '© 2026 | Medieval Crafts Forge & Code, Craft & Chronicles | Comunidade de Pintura de Miniaturas',
        helpExpand: 'Ajude a expandir este guia:',
        suggestCorrection: 'Viu algo errado ou quer sugerir uma nova tinta?',
        clickHere: 'Clique aqui para enviar uma correção ou sugestão.',
        tooltipMassa: 'Putty & Paste: Preparação e Correção: Massas acrílicas e epóxi para preencher fendas, corrigir falhas de fundição e esculpir novos detalhes. Verifique a contração e o tempo de secagem de cada material',
        tooltipEfeitos: 'Produtos para Weathering e Cenários: Inclui lavagens (washes) para realçar detalhes, filtros para mudar tons, e pastas de textura para criar solos realistas como concreto ou musgo',
        tooltipCores: 'Pigmentos e tintas base',
    },
    'EN': {
        tabCores: 'Colours',
        tabEfeitos: 'Effects',
        tabMassa: 'Putty',
        searchPlaceholder: 'Search for a term...',
        searchField: 'Select field...',
        noResults: 'No results found',
        noResultsContainer: 'Try adjusting your search criteria',
        tryAgain: 'RESET',
        showing: 'Showing',
        illustrative: 'Illustrative purposes only',
        searchInputLabel: 'Search',
        searchFieldLabel: 'Field',
        resultsLabel: 'results',
        headerLabel: 'Colour and Effects Catalogue',
        headerParagraph: 'Quick reference guide for paints, textures and painting techniques',
        disclaimerTitle: 'Disclaimer',
        disclaimerText: 'This application is a personal project and has no official affiliation with any brands or products. The information presented is based on research and may contain inaccuracies. Use as a reference, but always verify with official sources.',
        footerCopyright: '© 2026 | Medieval Crafts Forge & Code, Craft & Chronicles | Miniature Painting Community',
        helpExpand: 'Help expand this guide:',
        suggestCorrection: 'Did you spot an error or want to suggest a new paint?',
        clickHere: 'Click here to send a correction or suggestion.',
        tooltipMassa: 'Putty & Paste: Preparation and Correction: Acrylic and epoxy putties for filling gaps, fixing casting flaws, and sculpting new details. Check each material´s shrinkage and drying time',
        tooltipEfeitos: 'Weathering and Scenery Products: Includes washes to enhance details, filters to shift tones, and texture pastes to create realistic grounds like concrete or moss',
        tooltipCores: 'Base pigments and paints',
    }
};
const htmlMassasPT = `
<div class="medieval-table-wrapper">
  <div class="table-intro-text">
    <p style="padding: 20px">
      <i class="bi bi-info-circle-fill"></i> 
      Este guia de referência foi desenvolvido para documentar os comportamentos químicos e mecânicos observados em testes de bancada. 
      O objetivo é otimizar a escolha entre preenchimentos estéticos e colagens estruturais, minimizando desperdícios e danos em peças impressas ou modeladas.
    </p>
  </div>

  <table class="table table-dark custom-medieval-table">
    <thead>
      <tr>
        <th style="width: 15%">Característica / Produto</th>
        <th style="width: 20%">Cianoacrilato + Bicarbonato</th>
        <th style="width: 25%; color: #ff6b6b;">Araldite + Bicarbonato *</th>
        <th style="width: 20%; color: #51cf66;">Araldite (Puro)</th>
        <th style="width: 20%">Putty / Paste</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tempo de Trabalho</strong></td>
        <td>Segundos (quase imediato)</td>
        <td>Cerca de 5 minutos (Cura acelerada)</td>
        <td>Até 10 minutos (Trabalhável)</td>
        <td>Vários minutos a horas</td>
      </tr>
      <tr>
        <td><strong>Resistência</strong></td>
        <td>Muito alta, mas quebradiça ao impacto</td>
        <td>Extremamente alta (Inconsistente)</td>
        <td class="fw-bold text-info">Extremamente alta (Ligação estrutural)</td>
        <td>Baixa a moderada (Não estrutural)</td>
      </tr>
      <tr>
        <td><strong>Modelagem</strong></td>
        <td>Difícil de modelar; só preenche</td>
        <td>Massa bruta e instável</td>
        <td>Fluido; difícil de modelar antes de curar</td>
        <td>Excelente para modelar detalhes finos</td>
      </tr>
      <tr>
        <td><strong>Lixagem</strong></td>
        <td>Fácil (fica opaco e duro)</td>
        <td class="fw-bold text-warning">Impossível à mão (Pedra)</td>
        <td>Duro (Foco em Fixação)</td>
        <td>Muito fácil (Acabamento liso)</td>
      </tr>
      <tr>
        <td><strong>Contração</strong></td>
        <td>Mínima</td>
        <td>Nula (pode aquecer/expandir)</td>
        <td>Nula</td>
        <td>Pode contrair ligeiramente ao secar</td>
      </tr>
      <tr>
        <td><strong>Aplicação Ideal</strong></td>
        <td>Preenchimento rápido e travas</td>
        <td class="fw-bold text-danger">NÃO RECOMENDADO</td>
        <td>Colagem de peças principais (Estrutural)</td>
        <td>Acabamento de fendas e poros</td>
      </tr>
    </tbody>
  </table>

  <div class="table-footer-notes">
    <p><strong>* Referência Técnica (Araldite + Bicarbonato):</strong> A reação química acelera a cura drasticamente. Embora a dureza final seja extrema, a mistura torna-se mineral, impossibilitando o acabamento manual e gerando calor que pode deformar plásticos finos.</p>
    
    <div class="photo-placeholder-zone">
      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/araldite_bicarbonato.png" alt="Araldite com Bicarbonato" class="placeholder-image">
        <figcaption>Mistura Araldite + Bicarbonato: Reação exotérmica e textura mineral.</figcaption>
      </figure>
      
      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/putty.png" alt="Putty" class="placeholder-image">
        <figcaption>Putty : Aplicação suave ideal para acabamentos finos.</figcaption>
      </figure>

      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/putty_after_sandpaper.png" alt="Putty" class="placeholder-image">
        <figcaption>Putty: Acabamento suave após lixamento.</figcaption>
      </figure>

      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/ca_bicarbonato.png" alt="Cianoacrilato + Bicarbonato" class="placeholder-image">
        <figcaption>Cianoacrilato + Bicarbonato: Utilizado para fixar a miniatura na base ao aproveitar que o efeito de neve também é obtido do uso do bicarbonato de sódio, porém com cola PVA e água.</figcaption>
      </figure>
      
    </div>
  </div>

</div>`;

const htmlMassasEn = `
<div class="medieval-table-wrapper">
  <div class="table-intro-text">
    <p style="padding: 20px">
      <i class="bi bi-info-circle-fill"></i> 
      This reference guide was developed to document the chemical and mechanical behaviours observed during bench tests. 
      The objective is to optimise the choice between aesthetic fillers and structural bonding, minimising waste and damage to printed or modelled parts.
    </p>
  </div>

  <table class="table table-dark custom-medieval-table">
    <thead>
      <tr>
        <th style="width: 15%">Feature / Product</th>
        <th style="width: 20%">Cyanoacrylate + Baking Soda</th>
        <th style="width: 25%; color: #ff6b6b;">Araldite + Baking Soda *</th>
        <th style="width: 20%; color: #51cf66;">Araldite (Pure)</th>
        <th style="width: 20%">Putty / Paste</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Working Time</strong></td>
        <td>Immediate (almost instant)</td>
        <td>Approx. 5 minutes (Accelerated cure)</td>
        <td>Up to 10 minutes (Workable)</td>
        <td>Several minutes to hours</td>
      </tr>
      <tr>
        <td><strong>Strength</strong></td>
        <td>High (brittle on impact)</td>
        <td>Extremely high (Inconsistent)</td>
        <td class="fw-bold text-info">Extremely high (Structural bond)</td>
        <td>Low to moderate (Non-structural)</td>
      </tr>
      <tr>
        <td><strong>Modelling</strong></td>
        <td>Difficult to model; gap-filling only</td>
        <td>Coarse and unstable mass</td>
        <td>Fluid; difficult to model before curing</td>
        <td>Excellent for fine detail modelling</td>
      </tr>
      <tr>
        <td><strong>Sandability</strong></td>
        <td>Easy (cures matte and hard)</td>
        <td class="fw-bold text-warning">Impossible by hand (Stone-like)</td>
        <td>Hard (Focus on Fixation)</td>
        <td>Very easy (Smooth finish)</td>
      </tr>
      <tr>
        <td><strong>Shrinkage</strong></td>
        <td>Minimal</td>
        <td>None (may heat/expand)</td>
        <td>None</td>
        <td>May shrink slightly when drying</td>
      </tr>
      <tr>
        <td><strong>Ideal Application</strong></td>
        <td>Quick filling and locking</td>
        <td class="fw-bold text-danger">NOT RECOMMENDED</td>
        <td>Heavy/Main part bonding (Structural)</td>
        <td>Gap filling and surface pores</td>
      </tr>
    </tbody>
  </table>

  <div class="table-footer-notes">
    <p><strong>* Technical Reference (Araldite + Baking Soda):</strong> The chemical reaction accelerates the curing process drastically. Although the final hardness is extreme, the mixture becomes mineral-like, making manual finishing impossible and generating heat that may deform thin plastics.</p>
    
    <div class="photo-placeholder-zone">
      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/araldite_bicarbonato.png" alt="Araldite with Baking Soda" class="placeholder-image">
        <figcaption>Araldite + Baking Soda mixture: Exothermic reaction and mineral-like texture.</figcaption>
      </figure>
      
      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/putty.png" alt="Putty" class="placeholder-image">
        <figcaption>Putty: Smooth application, ideal for seamless finishing.</figcaption>
      </figure>

      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/putty_after_sandpaper.png" alt="Putty" class="placeholder-image">
        <figcaption>Putty: Smooth finish after sanding.</figcaption>
      </figure>

      <figure class="photo-item" style="margin-bottom: 40px">
        <img src="img/ca_bicarbonato.png" alt="Cianoacrilato + Bicarbonato" class="placeholder-image">
        <figcaption>Cianoacrilato + Baking Soda: Utilised to fix the miniature on the base, taking advantage of the snow effect obtained from using baking soda, but with PVA glue and water.</figcaption>
      </figure>

    </div>
  </div>

</div>`;

document.addEventListener('DOMContentLoaded', async () => {
  await detectLanguageAndLoad();
  setupEventListeners();  
  syncTabWithHash(); 
});

async function detectLanguageAndLoad() {
  let savedLang = getSavedLanguage();
  
  if (savedLang) {
      language = savedLang;
      const selectedLanguage = language === 'PT' ? 'PT' : 'EN';
      
      applyUiTranslations(selectedLanguage);
      loadDataColours(selectedLanguage);
      loadDataEffects(selectedLanguage);
      return;
  }  
  
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("192.168");

  if (isLocalhost) {
      language = 'PT';
      loadDataColours(language);
      loadDataEffects(language);
      return; 
  }

  try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      language = data.country_name; 
  } catch (error) {
      console.error("Falha ao detectar localização:", error);
      language = 'Portugal'; 
  }

  isPT = (language.startsWith('PT') || language.toLocaleUpperCase() === 'PORTUGAL' || language.toLocaleUpperCase === 'BRAZIL');
  const selectedLanguage = isPT ? 'PT' : 'EN';

  saveLanguage(selectedLanguage);

  applyUiTranslations(selectedLanguage);
  loadDataColours(selectedLanguage);
  loadDataEffects(selectedLanguage);
  console.log(`Idioma detectado: ${language} | Carregando dados em: ${selectedLanguage} | isPT: ${isPT}`);
}

function getSavedLanguage() {
    return localStorage.getItem('user_language');
}

function saveLanguage(lang) {
    localStorage.setItem('user_language', lang);
}

function applyUiTranslations(lang) {
  const texts = uiTranslations[lang];
  document.getElementById('tab-cores-label').innerHTML = `
      ${texts.tabCores} 
      <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" onclick="event.stopPropagation();" title="${texts.tooltipCores}"></i>
  `;

  document.getElementById('tab-efeitos-label').innerHTML = `
      ${texts.tabEfeitos} 
      <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" onclick="event.stopPropagation();" title="${texts.tooltipEfeitos}"></i>
  `;

  document.getElementById('tab-massa-label').innerHTML = `
      ${texts.tabMassa} 
      <i class="bi bi-info-circle ms-1" data-bs-toggle="tooltip" onclick="event.stopPropagation();" title="${texts.tooltipMassa}"></i>
  `;
  document.getElementById('searchInputLabel').innerText = texts.searchInputLabel;
  document.getElementById('searchInput').placeholder = texts.searchPlaceholder;
  document.getElementById('searchFieldLabel').innerText = texts.searchFieldLabel;
  document.getElementById('btnClear').innerText = texts.tryAgain;
  searchField = texts.searchField;
  noResults = texts.noResults;
  showing = texts.showing;
  illustrative = texts.illustrative;
  noResultsContainer = texts.noResultsContainer;
  resultsLabel = texts.resultsLabel;  
  document.getElementById('headerLabel').innerText = texts.headerLabel;
  document.getElementById('headerParagraph').innerText = texts.headerParagraph;
  document.getElementById('helpExpand').innerText = texts.helpExpand;
  document.getElementById('helpExpandButton').innerText = texts.clickHere;
  document.getElementById('footer').innerText = texts.footerCopyright;
  document.getElementById('disclaimer').innerText = texts.disclaimerText;
}

function loadDataColours(lang) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }

    isPT = (lang.startsWith('PT') || lang === 'PORTUGAL' || lang === 'BRAZIL');
    const langKey = isPT ? 'PT' : 'EN';
    const chaveNome = isPT ? "Cor Base" : "Base Colour";

    fetch(`./data/cores-${langKey}.json`)
        .then(response => response.json())
        .then(data => {
            if (data.cores) {
                data.cores.sort((a, b) => {
                    const nomeA = (a[chaveNome] || "").toUpperCase();
                    const nomeB = (b[chaveNome] || "").toUpperCase();
                    return nomeA.localeCompare(nomeB);
                });
            }
                
            allDataColours = data;                  
            
            applyUiTranslations(langKey);
            buildColorMap(); 
            updateSearchFields(); 
            updateFilters();
            displayResults();

            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => { loader.style.display = 'none'; }, 500);
            }
        })
        .catch(err => {
            showError("Erro ao trocar idioma.");
            // 3. Garantir que o loader suma mesmo se der erro
            if (loader) loader.style.display = 'none';
        });
}

function loadDataEffects(lang) {
    isPT = (lang.startsWith('PT') || lang === 'PORTUGAL' || lang === 'BRAZIL');
    const langKey = isPT ? 'PT' : 'EN';
    const chaveNome = isPT ? "Cor Base" : "Base Colour";

    fetch(`./data/efeitos-${langKey}.json`)
        .then(response => response.json())
        .then(data => {                        
            if (data.efeitos) {
                const chaveEfeito = isPT ? "Nome do Produto" : "Product Name";
                data.efeitos.sort((a, b) => {
                    const nomeA = (a[chaveEfeito] || "").toUpperCase();
                    const nomeB = (b[chaveEfeito] || "").toUpperCase();
                    return nomeA.localeCompare(nomeB);
                });
            }

            allDataEffects = data;            
            applyUiTranslations(langKey);            
            buildColorMap(); 
            updateSearchFields(); 
            updateFilters();
            displayResults();
        })
        .catch(err => showError("Erro ao trocar idioma."));
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput'); 
  const searchFieldSelect = document.getElementById('searchField'); 
  searchInput.addEventListener('input', validateSearchButton);
  searchFieldSelect.addEventListener('change', validateSearchButton);
  document.getElementById('btn-sort').addEventListener('click', toggleSort);
  validateSearchButton();

  document.querySelectorAll('.flag-container').forEach(flag => {
      flag.addEventListener('click', function() {
          clearSearch();  
          const selectedLang = this.dataset.lang; 
          
          document.querySelectorAll('.flag-container').forEach(f => f.classList.remove('active'));
          this.classList.add('active');

          language = selectedLang; 

          saveLanguage(selectedLang);

          loadDataColours(selectedLang);
          loadDataEffects(selectedLang);

          if (typeof switchTab === 'function') {
            switchTab('cores'); 
          } 
        
          const firstTab = document.querySelector('.tab-button[data-tab="cores"]');
          if (firstTab) {
              firstTab.click();
          }
      });
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);

    });
  });

  document.getElementById('btnSearch').addEventListener('click', performSearch);
  document.getElementById('btnClear').addEventListener('click', clearSearch);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

function switchTab(tab) {
  currentTab = tab;
  const resultsEl = document.getElementById('results');
  const info = document.getElementById('resultsInfo');
  const sortContainer = document.querySelector('.sort-container');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });

  window.history.replaceState(null, null, `#${tab}`);
      
  if (tab === 'massas') {
    resultsEl.innerHTML = '';
    resultsEl.classList.add('massa-active');
    performSearch();      
    info.style.display = 'none';
    sortContainer.style.display = 'none';
  } else {
    document.querySelector('.search-controls').style.display = 'block';
    resultsEl.classList.remove('massa-active');      
    info.style.display = 'block';
    sortContainer.style.display = 'block';
    sortAsc = true; 
    updateSearchFields();
    updateFilters();
    clearSearch(); 
  }
}

function updateSearchFields() {
    const fieldSelect = document.getElementById('searchField');
    if (!fieldSelect) return;
    fieldSelect.innerHTML = '';
    let dataRef = '';
    let fields = [];
    if (currentTab === 'cores') 
      dataRef = allDataColours.cores;
    else if (currentTab === 'efeitos')
      dataRef = allDataEffects.efeitos;

    if (dataRef && dataRef.length > 0) {
        fields = Object.keys(dataRef[0]);
        const ignoreList = isPT ? fieldsToIgnore : fieldsToIgnoreEN;
        fields = fields.filter(field => !ignoreList.includes(field));
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = searchField; 
    fieldSelect.appendChild(defaultOption);

    fields.forEach(field => {
        const option = document.createElement('option');
        option.value = field;
        option.textContent = field;
        fieldSelect.appendChild(option);
    });
}

function buildColorMap() {
    colorMap = {};
    if (!allDataColours.cores) return;

    const chaveNome = isPT ? "Cor Base" : "Base Colour";
    
    allDataColours.cores.forEach(c => {
        if (c[chaveNome]) {
            colorMap[c[chaveNome].toUpperCase()] = c["Hex"] || "#ccc";
        }
    });
}

function extractUniqueValues(fieldName) {
  const data = currentTab === 'cores' ? allDataColours.cores : allDataEffects.efeitos;
  const values = new Set();
  data.forEach(item => {
    const fieldValue = item[fieldName];
    if (fieldValue) {
      const parts = fieldValue.split(/[\/,]/).map(v => v.trim());
      parts.forEach(part => {
        if (part) values.add(part);
      });
    }
  });

  return Array.from(values).sort();   
}

function updateFilters() {
    const container = document.getElementById('filtersContainer');
    if (!container) return;
    container.innerHTML = '';    
    const langKey = isPT ? 'PT' : 'EN';
    const filtrosAtuais = configFiltros[langKey];

    Object.keys(filtrosAtuais).forEach(fieldName => {
        const values = filtrosAtuais[fieldName];        
        if (!values || values.length === 0) return;

        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';
        filterGroup.innerHTML = `<label class="filter-label">${fieldName}</label>`; 
        const checkboxesDiv = document.createElement('div');
        checkboxesDiv.className = 'filter-checkboxes';

        values.forEach(value => {
            const checkboxId = `filter-${fieldName}-${value}`.replace(/[^a-zA-Z0-9-]/g, '_');                  
            const label = document.createElement('label');
            label.className = 'checkbox-label';            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.value = value;
            checkbox.dataset.field = fieldName;          
            checkbox.addEventListener('change', performSearch);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(value));
            checkboxesDiv.appendChild(label);
        });

        filterGroup.appendChild(checkboxesDiv);
        container.appendChild(filterGroup);
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchField = document.getElementById('searchField').value;

    let data = 'massas';
    if (currentTab === 'cores')
      data = allDataColours.cores 
    else if (currentTab === 'efeitos') {
      data = allDataEffects.efeitos;
    }
    
    if (currentTab === 'massas') {
        const resultsContainer = document.getElementById('results');  
        resultsContainer.innerHTML = isPT ? htmlMassasPT : htmlMassasEn; 
        resultsInfo.innerHTML = isPT ? "<p>Guia de referência técnica para massas</p>" : "<p>Technical reference guide for fillers</p>";
        document.querySelector('.search-controls').style.display = 'none';
        return;
    }

    const selectedFilters = {};
    document.querySelectorAll('.filter-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
        const field = checkbox.dataset.field;
        if (!selectedFilters[field]) selectedFilters[field] = [];
        selectedFilters[field].push(checkbox.value);
    });

    let results = data.filter(item => {
        for (const [field, values] of Object.entries(selectedFilters)) {
            const itemValue = item[field];
            if (!itemValue) return false;
            const matches = values.some(value => itemValue.includes(value));
            if (!matches) return false;
        }

        if (searchTerm) {
            if (searchField) {
                const fieldValue = item[searchField];
                return fieldValue?.toString().toLowerCase().includes(searchTerm);
            } else {
                return Object.values(item).some(v => v?.toString().toLowerCase().includes(searchTerm));
            }
        }
        return true;
    });
    currentFilteredResults = results; 
    sortResults(currentFilteredResults);
    displayResults(currentFilteredResults);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchField').value = '';
  document.querySelectorAll('.filter-checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  displayResults();
  validateSearchButton();
}

function sortResults(dataList) {
    if (!dataList || dataList.length === 0) return;

    const chaveNome = isPT ? "Cor Base" : "Base Colour";
    const chaveEfeito = isPT ? "Nome do Produto" : "Product Name";

    dataList.sort((a, b) => {
        const valA = (a[chaveNome] || a[chaveEfeito] || "").toUpperCase();
        const valB = (b[chaveNome] || b[chaveEfeito] || "").toUpperCase();
        
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
}

function displayResults(results = null) {
  if (currentTab === 'massas') {
      return; 
  }

  let data = "";
  let resultsInfoLabel, resultsContainerLabel = "";

  data = results !== null ? results : (currentTab === 'cores' ? allDataColours.cores : allDataEffects.efeitos);
  resultsInfoLabel = noResults;
  resultsContainerLabel = noResultsContainer;
  
  const resultsContainer = document.getElementById('results');
  const resultsInfo = document.getElementById('resultsInfo');

  if (data.length === 0) {
    resultsInfo.innerHTML = `<p>${resultsInfoLabel}</p>`;
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>${resultsInfoLabel}</h3>
        <p>${resultsContainerLabel}</p>
      </div>
    `;
    return;
  }

  let tabName = "";
  tabName = currentTab === 'cores' ? 'cores' : 'efeitos';
  resultsInfo.innerHTML = `<p>${showing} <strong>${data.length}</strong> ${resultsLabel}</p>`;
  resultsContainer.innerHTML = data.map(item => createCard(item)).join('');
}

function createCard(item) {
  const mainHex = item['Hex'] || '#ccc';
  const mainContrast = getContrastColor(mainHex);
  const mainSpecialClass = getSpecialClass(mainHex);


    let cardHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${(item['Cor Base'] || item['Nome do Produto'] || item['Base Colour'] || item['Product Name'] || '').toUpperCase()}</span>          
          <span class="card-hex ${mainSpecialClass}" style="background-color: ${mainHex}; color: ${mainContrast}" onclick="copyToClipboard('${mainHex}', event)"
      title="Clique para copiar HEX">
            ${item['Hex'].toUpperCase() || ''}
          </span>
        </div>
        <span class="card-code">${(item['Código'] || item['Code'] || '').toUpperCase()}</span>        
    `;

  const hexColor = item.Hex || '#ccc'; // Fallback caso não haja cor

  cardHTML += `
      <div class="dilution-container">
          <div class="dilution-rule ${mainSpecialClass}" style="--paint-color: ${hexColor};"></div>
          <div class="dilution-disclaimer">${illustrative}</div>
      </div>
  `;

    Object.entries(item).forEach(([key, value]) => {
      if (key === 'Cor Base' || key === 'Código' || key === 'Keywords' || key === 'Nome do Produto ' || key === 'Hex' && key !== 'Complementar') return;
      if (key === 'Base Colour' || key === 'Code' || key === 'Keywords' || key === 'Product Name' || key === 'Hex' && key !== 'Complementary') return;

      let displayValue = value;
      let displayKey = key.replace(/\s*\(.*/, ""); // Limpa os parênteses (ex: Temperatura)

      if (key === 'Complementar' || key === 'Complementary') {
        // Se o valor estiver vazio no JSON ou não existir
        if (!value || value.trim() === "") {
          displayValue = `<span style="color: #999; font-style: italic;">N/A</span>`;
        } else {
          const compHex = colorMap[value.toUpperCase()];
          
          if (compHex) {
            const compContrast = getContrastColor(compHex);
            const compSpecialClass = getSpecialClass(compHex);
            
            displayValue = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>${value}</span>
                <span class="card-code ${compSpecialClass}" 
                      style="background-color: ${compHex}; color: ${compContrast}; 
                            padding: 2px 8px; font-size: 0.7rem; border: 1px solid rgba(0,0,0,0.1);">
                  ${compHex}
                </span>
              </div>
            `;
          } else {
            displayValue = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>${value}</span>
                <span style="font-size: 0.7rem; color: #999; border: 1px solid #ccc; padding: 2px 5px; border-radius: 3px;">
                  Hex N/A
                </span>
              </div>
            `;
          }
        }
      }
      // ----------------------------------

      cardHTML += `
        <div class="card-field">
          <div class="card-label">${displayKey}</div>
          <div class="card-value">${displayValue}</div>
        </div>
        
      `;    
    });
    
     cardHTML += `
        <div class="card-keywords">${item['Keywords'] || ''}</div>
      `;    

    cardHTML += `</div>`;
    return cardHTML;  
}

function getSpecialClass(hexColor) {
  const hex = (hexColor || '').replace('#', '').toUpperCase();
  
  if (hex === 'B8B8B8') return 'silver-preview';
  if (hex === 'D4AF37') return 'gold-preview';
  
  return '';
}


function getContrastColor(hexColor) {
  if (!hexColor || hexColor === '') return 'white';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showError(message) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>Erro</h3>
      <p>${message}</p>
    </div>
  `;
}

function validateSearchButton() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  const searchField = document.getElementById('searchField').value;
  const btnSearch = document.getElementById('btnSearch');    
  const hasText = searchTerm.length > 0;
  const hasFieldSelected = searchField !== "" && searchField !== null;
  const isFormReady = hasText && hasFieldSelected;
  btnSearch.disabled = !isFormReady;
    
  if (btnSearch.disabled) {
    btnSearch.style.opacity = "0.5";
    btnSearch.style.cursor = "not-allowed";
  } else {
    btnSearch.style.opacity = "1";
    btnSearch.style.cursor = "pointer";
  }
}

function toggleSort() {
    sortAsc = !sortAsc;
    const btn = document.getElementById('btn-sort');
    
    if (btn) {
        btn.classList.toggle('desc', !sortAsc);
        performSearch();
    }    
}

function copyToClipboard(text, event) {
    if (event) event.stopPropagation();

    navigator.clipboard.writeText(text).then(() => {
        const element = event.target;
        const originalText = element.innerText;
        element.innerText = "COPIADO!";
        element.style.transform = "scale(1.1)";        
        setTimeout(() => {
            element.innerText = originalText;
            element.style.transform = "scale(1.0)";
        }, 800);
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        alert("Erro ao copiar HEX");
    });
}

 window.addEventListener('load', () => {
  setTimeout(() => {
    updateSearchFields();
    updateFilters();
    displayResults();
  }, 100);
});


window.addEventListener('load', syncTabWithHash);

window.addEventListener('hashchange', syncTabWithHash);

function syncTabWithHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  const tabMap = {
    'cores': 'cores', 'colours': 'cores',
    'efeitos': 'efeitos', 'effects': 'efeitos',
    'massas': 'massas', 'putty': 'massas'
  };

  if (tabMap[hash]) {
    setTimeout(() => {
      switchTab(tabMap[hash]);
    }, 10);
  }
}