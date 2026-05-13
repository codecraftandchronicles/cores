let allDataColours = { colours: []};
let allDataEffects = { effects: [] };
let currentTab = 'colours';
const fieldsToIgnoreEN = ['Hex', 'Role of Complementary', 'Complementary', 'Temperature','Phase','Saturation Level', 'Manufacturer', 'Owned'];
let colorMap = {};
let sortAsc = true;
let currentFilteredResults = []; 
let searchField = "", noResults = "", showing = "", illustrative = "", noResultsContainer = "", resultsLabel = "", headerLabel = "", headerParagraph = "";
const configFiltros = {    
    'EN': {
        'Temperature': ['Warm', 'Cold', 'Neutral'],
        'Phase': ['Base', 'Shadow', 'Highlight', 'Filter', 'Fluorescent', 'TMM'],
        'Saturation': ['Light', 'Medium', 'Dark'],
        'Manufacturer': ['AK', 'Citadel', 'Vallejo']
    }
};

const htmlPutty = `
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
  await PageLoad();
  setupEventListeners();  
  syncTabWithHash(); 
});

async function PageLoad() {  
  loadDataColours();
  loadDataEffects();
}


function loadDataColours() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }    

    fetch(`./data/colours.json`)
        .then(response => response.json())
        .then(data => {
            if (data.colours) {
                data.colours.sort((a, b) => {
                    const nomeA = (a["Base Colour"] || "").toUpperCase();
                    const nomeB = (b["Base Colour"] || "").toUpperCase();
                    return nomeA.localeCompare(nomeB);
                });
            }
                
            allDataColours = data;                  
            
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
    const chaveNome = "Base Colour";

    fetch(`./data/effects.json`)
        .then(response => response.json())
        .then(data => {                        
            if (data.effects) {
                data.effects.sort((a, b) => {
                    const nomeA = (a["Product Name"] || "").toUpperCase();
                    const nomeB = (b["Product Name"] || "").toUpperCase();
                    return nomeA.localeCompare(nomeB);
                });
            }

            allDataEffects = data;
            buildColorMap(); 
            updateSearchFields(); 
            updateFilters();
            displayResults();
        })
        .catch(err => showError("Error to load the data."));
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
          document.querySelectorAll('.flag-container').forEach(f => f.classList.remove('active'));
          this.classList.add('active');
          loadDataColours();
          loadDataEffects();

          if (typeof switchTab === 'function') {
            switchTab('colours'); 
          } 
        
          const firstTab = document.querySelector('.tab-button[data-tab="colours"]');
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
  const searchControls = document.querySelector('.search-controls');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  window.history.replaceState(null, null, `#${tab}`);
      
  if (tab === 'putty') {
    if (resultsEl) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('massa-active');
    }
    if (searchControls) searchControls.style.setProperty('display', 'none', 'important');
    if (info) info.style.display = 'none';
    if (sortContainer) sortContainer.style.display = 'none';
    
    performSearch(); 
  } else {
    if (searchControls) {
      searchControls.style.setProperty('display', 'grid', 'important');
    }
    
    if (resultsEl) resultsEl.classList.remove('massa-active');      
    if (info) info.style.display = 'block';
    if (sortContainer) sortContainer.style.display = 'block';
    
    // Atualiza a UI sem resetar o scroll ou o estado
    updateSearchFields();
    updateFilters();
    displayResults(); 
  }
}

function updateSearchFields() {
    const fieldSelect = document.getElementById('searchField');
    if (!fieldSelect) return;
    fieldSelect.innerHTML = '';
    let dataRef = '';
    let fields = [];
    if (currentTab === 'colours') 
      dataRef = allDataColours.colours;
    else if (currentTab === 'effects')
      dataRef = allDataEffects.effects;

    if (dataRef && dataRef.length > 0) {
        fields = Object.keys(dataRef[0]);
        const ignoreList = fieldsToIgnoreEN;
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
    if (!allDataColours.colours) return;

    const chaveNome = "Base Colour";
    
    allDataColours.colours.forEach(c => {
        if (c[chaveNome]) {
            colorMap[c[chaveNome].toUpperCase()] = c["Hex"] || "#ccc";
        }
    });
}

function extractUniqueValues(fieldName) {
  const data = currentTab === 'colours' ? allDataColours.colours : allDataEffects.effects;
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
    const filtrosAtuais = configFiltros['EN'];

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

    let data = 'putty';
    if (currentTab === 'colours')
      data = allDataColours.colours 
    else if (currentTab === 'effects') {
      data = allDataEffects.effects;
    }

    console.log(currentTab, data);
    
    if (currentTab === 'putty') {
        const resultsContainer = document.getElementById('results');  
        resultsContainer.innerHTML = htmlPutty; 
        resultsInfo.innerHTML = "<p>Technical reference guide for fillers</p>";
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

    dataList.sort((a, b) => {
        const valA = (a["Base Colour"] || a["Product Name"] || "").toUpperCase();
        const valB = (b["Base Colour"] || b["Product Name"] || "").toUpperCase();
        
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
}

function displayResults(results = null) {
  if (currentTab === 'putty') {
      return; 
  }

  let data = "";
  let resultsInfoLabel, resultsContainerLabel = "";

  data = results !== null ? results : (currentTab === 'colours' ? allDataColours.colours : allDataEffects.effects);  
  
  const resultsContainer = document.getElementById('results');
  const resultsInfo = document.getElementById('resultsInfo');

  if (data.length === 0) {
    resultsInfo.innerHTML = `<p>${resultsInfoLabel}</p>`;
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    `;
    return;
  }

  let tabName = "";
  tabName = currentTab === 'colours' ? 'colours' : 'effects';
  resultsInfo.innerHTML = `<p>${showing} <strong>${data.length}</strong> results</p>`;
  resultsContainer.innerHTML = data.map(item => createCard(item)).join('');
}

function createCard(item) {
  const mainHex = item['Hex'] || '#ccc';
  const mainContrast = getContrastColor(mainHex);
  const mainSpecialClass = getSpecialClass(mainHex);


    let cardHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${(item['Base Colour'] || item['Product Name'] || '').toUpperCase()}</span>          
          <span class="card-hex ${mainSpecialClass}" style="background-color: ${mainHex}; color: ${mainContrast}" onclick="copyToClipboard('${mainHex}', event)"
      title="Clique para copiar HEX">
            ${item['Hex'].toUpperCase() || ''}
          </span>
        </div>
        <span class="card-code">${(item['Code'] || '').toUpperCase()}</span>        
    `;

  const hexColor = item.Hex || '#ccc';

  cardHTML += `
      <div class="dilution-container">
          <div class="dilution-rule ${mainSpecialClass}" style="--paint-color: ${hexColor};"></div>
          <div class="dilution-disclaimer">${illustrative}</div>
      </div>
  `;

    Object.entries(item).forEach(([key, value]) => {
      if (key === 'Base Colour' || key === 'Code' || key === 'Keywords' || key === 'Product Name' || key === 'Hex' || key === 'Owned' && key !== 'Complementary') return;

      let displayValue = value;
      let displayKey = key.replace(/\s*\(.*/, ""); 

      if (key === 'Complementary') {
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
        element.innerText = "COPIED!";
        element.style.transform = "scale(1.1)";        
        setTimeout(() => {
            element.innerText = originalText;
            element.style.transform = "scale(1.0)";
        }, 800);
    }).catch(err => {
        console.error('Error to copy HEX: ', err);
        alert("Error to copy HEX");
    });
}

function exportInventoryToCSV() {
    const ownedColours = allDataColours.colours.filter(colour => colour.Owned === "True" || colour.Owned === true);    
    const ownedEffects = allDataEffects.effects.filter(effects => effects.Owned === "True" || effects.Owned === true);

    if (ownedColours.length === 0 && ownedEffects.length === 0) {
        alert("No items marked as owned in inventory.");
        return;
    }

    let csvContent = "\uFEFF"; 
    csvContent += ["Base Colour", "Code"].join(",") + "\n";

    ownedColours.forEach(colour => {
        const row = [
            `"${colour["Base Colour"]}"`, 
            `"${colour["Code"]}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    ownedEffects.forEach(e => {
        const row = [
            `"${e["Product Name"]}"`, 
            `"${e["Code"]}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `meu_inventario_tintas.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    'colours': 'colours','effects': 'effects','putty': 'putty'
  };

  if (tabMap[hash]) {
    setTimeout(() => {
      switchTab(tabMap[hash]);
    }, 10);
  }
}