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

  // Atualizar campos de pesquisa
  updateSearchFields();

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
  resultsInfo.innerHTML = `<p>Mostrando <strong>${data.length}</strong> ${tabName}</p>`;

  resultsContainer.innerHTML = data.map(item => createCard(item)).join('');
}

function createCard(item) {
  const fields = Object.entries(item);
  const title = item['Cor Base'] || item['Unnamed: 0'] || 'Item';
  const code = item['Código'] || item['Unnamed: 1'] || '';

  let cardHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${escapeHtml(title)}</div>
        ${code ? `<div class="card-code">${escapeHtml(code)}</div>` : ''}
      </div>
  `;

  fields.forEach(([key, value]) => {
    // Pular campos que já foram mostrados no header
    if (key === 'Cor Base' || key === 'Unnamed: 0' || key === 'Código' || key === 'Unnamed: 1') {
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
