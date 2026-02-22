let allData = {
  cores: [],
  efeitos: []
};

let currentTab = 'cores';
const fieldsToIgnore = ['Hex', 'Papel do Complementar (Sombra, Reflexo, Contraste, Desgaste etc.)', 'Complementar', 'Temperatura (Quente/Frio/Neutra)'];
let colorMap = {};
const filterFields = [
  'Temperatura (Quente/Frio/Neutra)',
  'Fase (Base / Sombra / Realce / Filtro / Fluorescente / TMM)',
  'Nível de saturação (claro/médio/escuro)'
];
let language = 'PT'; // Definir idioma padrão para português

// Obtém o idioma preferencial
fetch('https://ipapi.co/json/')
  .then(res => res.json())
  .then(data => {
    language = data.country_name
  });

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadData(language);
  setupEventListeners();  
});

function loadData(language) {
  if (language !== 'PT') {
    language = 'EN'; // Fallback para inglês se não for português 
  }
  fetch(`./data/cores-efeitos-${language}.json`)
    .then(response => response.json())
    .then(data => {
      allData = data;    
      displayResults();

      colorMap = {};
      allData.cores.forEach(c => {
        colorMap[c["Cor Base"].toUpperCase()] = c["Hex"];
      });

    })
    .catch(error => {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar os dados. Verifique se o ficheiro JSON está acessível.');
    });
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');  
  searchInput.addEventListener('input', validateSearchButton);
  validateSearchButton();

  // Botões de aba
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Botão de pesquisa
  document.getElementById('btnSearch').addEventListener('click', performSearch);

  // Botão de limpar
  document.getElementById('btnClear').addEventListener('click', clearSearch);

  // Enter no input de pesquisa
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

function switchTab(tab) {
  currentTab = tab;

  // Atualizar botões de aba
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });

  updateSearchFields();
  updateFilters();

  // Limpar pesquisa e mostrar todos os resultados
  clearSearch();
}

function updateSearchFields() {
  const fieldSelect = document.getElementById('searchField');
  fieldSelect.innerHTML = '';

  let fields = [];
  if (currentTab === 'cores' && allData.cores.length > 0) {
    fields = Object.keys(allData.cores[0]);
    filtersContainer.style.display = 'block'; // Mostrar filtros para cores
  } else if (currentTab === 'efeitos' && allData.efeitos.length > 0) {
    fields = Object.keys(allData.efeitos[0]);
    filtersContainer.style.display = 'none'; // Esconder filtros para efeitos
  }

  fields = fields.filter(field => !fieldsToIgnore.includes(field));

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Selecionar campo...';
  fieldSelect.appendChild(defaultOption);

  fields.forEach(field => {
    const option = document.createElement('option');
    option.value = field;
    option.textContent = field;
    fieldSelect.appendChild(option);
  });
}

// Extrair valores únicos de um campo
function extractUniqueValues(fieldName) {
  const data = currentTab === 'cores' ? allData.cores : allData.efeitos;
  const values = new Set();

  data.forEach(item => {
    const fieldValue = item[fieldName];
    if (fieldValue) {
      // Dividir por / ou , para pegar valores individuais
      const parts = fieldValue.split(/[\/,]/).map(v => v.trim());
      parts.forEach(part => {
        if (part) values.add(part);
      });
    }
  });

  return Array.from(values).sort();
}

// Atualizar filtros com checkboxes
function updateFilters() {
  const container = document.getElementById('filtersContainer');
  container.innerHTML = '';

  filterFields.forEach(fieldName => {
    const values = extractUniqueValues(fieldName);    
    
    if (values.length === 0) return;

    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    filterGroup.innerHTML = `<label class="filter-label">${fieldName.replace(/\s*\(.*/, "")}</label>`;    

    const checkboxesDiv = document.createElement('div');
    checkboxesDiv.className = 'filter-checkboxes';


    values.forEach(value => {
      const checkboxId = `filter-${fieldName}-${value}`.replace(/[^a-zA-Z0-9-]/g, '_');
      // console.log(`Criando checkbox: ${checkboxId} para valor: ${value} no campo: ${fieldName}`);
      
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
  const data = currentTab === 'cores' ? allData.cores : allData.efeitos;

  // Obter checkboxes selecionados
  const selectedFilters = {};
  document.querySelectorAll('.filter-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
    const field = checkbox.dataset.field;
    if (!selectedFilters[field]) {
      selectedFilters[field] = [];
    }
    selectedFilters[field].push(checkbox.value);
  });

  let results = data.filter(item => {
    // Filtrar por checkboxes (AND entre filtros, OR dentro do mesmo filtro)
    for (const [field, values] of Object.entries(selectedFilters)) {
      const itemValue = item[field];
      if (!itemValue) return false;

      // Verificar se algum dos valores selecionados está no item (OR)
      const matches = values.some(value => {
        return itemValue.includes(value);
      });

      if (!matches) return false; // AND com outros filtros
    }

    // Filtrar por texto
    if (searchTerm) {
      if (searchField) {
        // Pesquisar num campo específico
        const fieldValue = item[searchField];
        if (fieldValue === null || fieldValue === undefined) return false;
        return fieldValue.toString().toLowerCase().includes(searchTerm);
      } else {
        // Pesquisar em todos os campos
        return Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchTerm);
        });
      }
    }

    return true;
  });

  displayResults(results);
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

function displayResults(results = null) {
  const data = results !== null ? results : (currentTab === 'cores' ? allData.cores : allData.efeitos);
  const resultsContainer = document.getElementById('results');
  const resultsInfo = document.getElementById('resultsInfo');

  if (data.length === 0) {
    resultsInfo.innerHTML = `<p>Nenhum resultado encontrado</p>`;
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Nenhum resultado</h3>
        <p>Tente ajustar os critérios de pesquisa</p>
      </div>
    `;
    return;
  }

  const tabName = currentTab === 'cores' ? 'cores' : 'efeitos';
  resultsInfo.innerHTML = `<p>A exibir <strong>${data.length}</strong> ${tabName}</p>`;

  resultsContainer.innerHTML = data.map(item => createCard(item)).join('');
}

function createCard(item) {
  // 1. Pega o Hex principal para o título do card
  const mainHex = item['Hex'] || '#ccc';
  const mainContrast = getContrastColor(mainHex);
  const mainSpecialClass = getSpecialClass(mainHex);

  let cardHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">${(item['Cor Base'] || item['Nome do Produto'] || '').toUpperCase()}</span>
        <span class="card-code ${mainSpecialClass}" style="background-color: ${mainHex}; color: ${mainContrast}">
          ${item['Código'] || ''}
        </span>
      </div>
      <div class="card-keywords">${item['Keywords'] || ''}</div>
  `;

const hexColor = item.Hex || '#ccc'; // Fallback caso não haja cor

cardHTML += `
    <div class="dilution-container">
        <div class="dilution-rule" style="--paint-color: ${hexColor};"></div>
        <div class="dilution-disclaimer">*Mera ilustração visual</div>
    </div>
`;

  // 2. Itera sobre os campos do JSON
  Object.entries(item).forEach(([key, value]) => {
    // Ignora campos que não queremos exibir como texto simples
    if (key === 'Cor Base' || key === 'Código' || key === 'Keywords' || key === 'Nome do Produto' || (fieldsToIgnore.includes(key) && key !== 'Complementar')) return;

    let displayValue = value;
    let displayKey = key.replace(/\s*\(.*/, ""); // Limpa os parênteses (ex: Temperatura)

    // --- LÓGICA DA COR COMPLEMENTAR ---
    if (key === 'Complementar') {
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
          // Se tiver o nome da cor, mas o Hex não estiver no nosso mapa
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
  const btnSearch = document.getElementById('btnSearch');
  
  btnSearch.disabled = searchTerm.length === 0;
  
  if (btnSearch.disabled) {
    btnSearch.style.opacity = "0.5";
    btnSearch.style.cursor = "not-allowed";
  } else {
    btnSearch.style.opacity = "1";
    btnSearch.style.cursor = "pointer";
  }
}

// Inicializar campos de pesquisa
 window.addEventListener('load', () => {
  // Pequeno delay para garantir que os dados foram carregados
  setTimeout(() => {
    updateSearchFields();
    updateFilters();
    displayResults();
  }, 100);
});
