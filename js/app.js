let allData = {
  cores: [],
  efeitos: []
};

let currentTab = 'cores';

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

function loadData() {
  fetch('./data/cores-efeitos.json')
    .then(response => response.json())
    .then(data => {
      allData = data;
      updateSearchFields();
      displayResults();
    })
    .catch(error => {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar os dados. Verifique se o ficheiro JSON está acessível.');
    });
}

function setupEventListeners() {
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

  // Limpar pesquisa e mostrar todos os resultados
  clearSearch();
}

function updateSearchFields() {
  const fieldSelect = document.getElementById('searchField');
  fieldSelect.innerHTML = '';

  let fields = [];
  if (currentTab === 'cores' && allData.cores.length > 0) {
    fields = Object.keys(allData.cores[0]);
  } else if (currentTab === 'efeitos' && allData.efeitos.length > 0) {
    fields = Object.keys(allData.efeitos[0]);
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Todos os campos';
  fieldSelect.appendChild(defaultOption);

  fields.forEach(field => {
    const option = document.createElement('option');
    option.value = field;
    option.textContent = field;
    fieldSelect.appendChild(option);
  });
}

function performSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  const searchField = document.getElementById('searchField').value;
  const data = currentTab === 'cores' ? allData.cores : allData.efeitos;

  let results = data;

  if (searchTerm) {
    results = data.filter(item => {
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
    });
  }

  displayResults(results);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchField').value = '';
  displayResults();
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
  const fields = Object.entries(item);
  const title = item['Cor Base'] || item['Nome do Produto'] || 'Item';
  const code = item['Código'] || item['Código'] || '';
  const keywords = item['Palavras-Chave'] || item['Keywords'] || '';
  const hex = item['Hex'] || '';
  const specialClass = getSpecialClass(hex);
  const codeStyle = specialClass ? '' : `background-color: ${hex}; color: ${getContrastColor(hex)};`;

  let cardHTML = `
    <div class="card" onmouseover="this.style.borderColor = '${hex}';" onmouseout="this.style.borderColor = '#e0e0e0';">
      <div class="card-header">
        <div class="card-title">${escapeHtml(title)}</div>
        ${code ? `<div class="card-code ${specialClass}" style="${codeStyle}">${escapeHtml(code)}</div>` : ''}
        ${keywords ? `<div class="card-keywords">${escapeHtml(keywords)}</div>` : ''}
      </div>
  `;

  fields.forEach(([key, value]) => {
    // Pular campos que já foram mostrados no header
    if (key === 'Cor Base' || key === 'Nome do Produto' || key === 'Código' || key === 'Palavras-Chave' || key === 'Keywords' || key === 'Hex') {
      return;
    }

    if (value === null || value === undefined || value === '') {
      return;
    }

    const displayValue = escapeHtml(String(value));
    const displayKey = escapeHtml(key);

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

// Inicializar campos de pesquisa
window.addEventListener('load', () => {
  updateSearchFields();
});
