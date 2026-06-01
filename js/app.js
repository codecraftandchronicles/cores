// ============ CONSTANTS ============
// Tab identifiers
const TAB_NAMES = Object.freeze({
  COLOURS: 'colours',
  EFFECTS: 'effects',
  PUTTY: 'putty',
  PROJECTS: 'projects'
});

// Field names
const FIELD_KEYS = Object.freeze({
  BASE_COLOUR: 'Base Colour',
  PRODUCT_NAME: 'Product Name',
  CODE: 'Code',
  HEX: 'Hex',
  TEMPERATURE: 'Temperature',
  PHASE: 'Phase',
  SATURATION: 'Saturation',
  MANUFACTURER: 'Manufacturer',
  COMPLEMENTARY: 'Complementary',
  ROLE_OF_COMPLEMENTARY: 'Role of Complementary',
  FUNCTION: 'Function',
  KEYWORDS: 'Keywords',
  OWNED: 'Owned',
  STATUS: 'Status',
  PROJECT_NAME: 'ProjectName',
  PCT: 'Pct',
  FINISH_DATE: 'FinishDate',
  DESCRIPTION: 'Description',
  MATERIALS: 'Materials',
  PROJECT_IMAGE: 'ProjectImage',
  URL: 'URL'
});

// ============ STATE ============
let allDataColours = { colours: []};
let allDataEffects = { effects: [] };
let allDataProjects = { projects: [] };
let allDataTools = { tools: [] };
// ============ PROJECT SORT FUNCTION ============
// Unified sort logic: by status priority, then by finish date (desc for done), then by name
const PROJECT_SORT_ORDER = {
  "to do": 1,
  "in progress": 2,
  "on the bench": 2,
  "done": 3,
  "completed": 3,
  "parking lot": 4
};

function projectSortFunc(a, b) {
  const statusA = (a[FIELD_KEYS.STATUS] || "").toLowerCase().trim();
  const statusB = (b[FIELD_KEYS.STATUS] || "").toLowerCase().trim();
  
  const priorityA = PROJECT_SORT_ORDER[statusA] || 99;
  const priorityB = PROJECT_SORT_ORDER[statusB] || 99;
  
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }
  
  if (statusA === "done" || statusA === "completed") {
    const dateA = parseDate(a[FIELD_KEYS.FINISH_DATE]);
    const dateB = parseDate(b[FIELD_KEYS.FINISH_DATE]);
    return dateB - dateA;
  }
  
  const nameA = (a[FIELD_KEYS.PROJECT_NAME] || "").toUpperCase();
  const nameB = (b[FIELD_KEYS.PROJECT_NAME] || "").toUpperCase();
  return nameA.localeCompare(nameB);
}

// ============ GLOBAL VARIABLES ============
let currentTab = TAB_NAMES.COLOURS;
let currentPrimerClass = 'primer-v-white'; // Default primer
const fieldsToIgnoreEN = [FIELD_KEYS.HEX, FIELD_KEYS.ROLE_OF_COMPLEMENTARY, FIELD_KEYS.COMPLEMENTARY, FIELD_KEYS.TEMPERATURE, FIELD_KEYS.PHASE, 'Saturation Level', FIELD_KEYS.MANUFACTURER, FIELD_KEYS.OWNED];
let colorMap = {};
let sortAsc = true;
let currentFilteredResults = [];
let searchField = "", noResults = "", showing = "", illustrative = "", noResultsContainer = "", resultsLabel = "", headerLabel = "", headerParagraph = "";
const configFiltros = {    
    'EN': {
        [TAB_NAMES.COLOURS]: {
            [FIELD_KEYS.TEMPERATURE]: ['Warm', 'Cold', 'Neutral'],
            [FIELD_KEYS.PHASE]: ['Base', 'Shadow', 'Highlight', 'Filter', 'Fluorescent', 'TMM'],
            [FIELD_KEYS.SATURATION]: ['Light', 'Medium', 'Dark'],
            [FIELD_KEYS.MANUFACTURER]: ['AK', 'Citadel', 'Vallejo']
        },
        [TAB_NAMES.EFFECTS]: {
            [FIELD_KEYS.MANUFACTURER]: ['AK', 'Citadel', 'Vallejo']
        }
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
  // Load all data using the generic loader
  loadData('colours', 'colours', FIELD_KEYS.BASE_COLOUR, 'allDataColours');
  loadData('effects', 'effects', FIELD_KEYS.PRODUCT_NAME, 'allDataEffects');
  loadData('projects', 'projects', null, 'allDataProjects', projectSortFunc);
  loadData('tools', 'tools', 'Name', 'allDataTools');
}

function loadData(endpoint, dataKey, sortField, globalName, customSort = null) {
  const loader = document.getElementById('loading-overlay');
  if (loader && endpoint === 'colours') {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }

  fetch(`./data/${endpoint}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data[dataKey]) {
        throw new Error(`Invalid data structure: missing '${dataKey}' key`);
      }

      if (customSort) {
        data[dataKey].sort(customSort);
      } else if (sortField) {
        data[dataKey].sort((a, b) => {
          const valA = (a[sortField] || "").toUpperCase();
          const valB = (b[sortField] || "").toUpperCase();
          return valA.localeCompare(valB);
        });
      }

      // Assign data to the appropriate global variable
      switch (globalName) {
        case 'allDataColours':
          allDataColours = data;
          break;
        case 'allDataEffects':
          allDataEffects = data;
          break;
        case 'allDataProjects':
          allDataProjects = data;
          break;
        case 'allDataTools':
          allDataTools = data;
          break;
      }

      console.log(`✓ Loaded ${endpoint}: ${data[dataKey].length} items`);
      buildColorMap();
      updateSearchFields();
      updateFilters();
      displayResults();

      if (loader && endpoint === 'colours') {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
      }
    })
    .catch(err => {
      console.error(`✗ Failed to load ${endpoint}:`, err);
      showError(`Unable to load ${endpoint}. Please refresh the page.`);
      if (loader) loader.style.display = 'none';
    });
}

function parseDate(dateString) {
    if (!dateString) return new Date(0);
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(0);
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
          loadData('colours', 'colours', 'Base Colour', 'allDataColours');
          loadData('effects', 'effects', FIELD_KEYS.PRODUCT_NAME, 'allDataEffects');
          loadData('projects', 'projects', null, 'allDataProjects', projectSortFunc);
          loadData('tools', 'tools', 'Name', 'allDataTools');

          if (typeof switchTab === 'function') {
            switchTab('colours'); 
          } 
        
          const firstTab = document.querySelector(`.tab-button[data-tab="${TAB_NAMES.COLOURS}"]`);
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

  // Primer selector event listener - set up with delay to ensure DOM is ready
  setTimeout(() => {
    const primerSelect = document.getElementById('primerSelect');
    if (primerSelect) {
      primerSelect.addEventListener('change', (e) => {
        const selectedPrimer = e.target.value || 'primer-v-white';
        applyPrimerToCards(selectedPrimer);
      });
    }
  }, 100);
}


function switchTab(tab) {
  currentTab = tab;
  const resultsEl = document.getElementById('results');
  const info = document.getElementById('resultsInfo');
  const sortContainer = document.querySelector('.sort-container');
  const primerSelectorContainer = document.querySelector('.primer-selector-container');
  const searchControls = document.querySelector('.search-controls');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  window.history.replaceState(null, null, `#${tab}`);
      
  if (tab === TAB_NAMES.PUTTY || tab === TAB_NAMES.PROJECTS) {
    if (resultsEl) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('massa-active');
    }
    if (searchControls) searchControls.style.setProperty('display', 'none', 'important');
    if (info) info.style.display = 'none';
    if (sortContainer) sortContainer.style.display = 'none';
    if (primerSelectorContainer) primerSelectorContainer.style.display = 'none';
    
    performSearch(); 
  } else {
    if (searchControls) {
      searchControls.style.setProperty('display', 'grid', 'important');
    }
    
    if (resultsEl) resultsEl.classList.remove('massa-active');      
    if (info) info.style.display = 'block';
    if (sortContainer) sortContainer.style.display = 'block';
    if (primerSelectorContainer) primerSelectorContainer.style.display = 'flex';
    
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
    if (currentTab === TAB_NAMES.COLOURS) 
      dataRef = allDataColours.colours;
    else if (currentTab === TAB_NAMES.EFFECTS)
      dataRef = allDataEffects.effects;
    else if (currentTab === TAB_NAMES.PROJECTS)
      dataRef = allDataProjects.projects;

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

    const chaveNome = FIELD_KEYS.BASE_COLOUR;
    
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
    const filtrosAtuais = configFiltros['EN'][currentTab] || {};

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
    if (currentTab === TAB_NAMES.PROJECTS) {
        document.querySelectorAll('.filter-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });

        const searchFieldDDL = document.getElementById('searchField');
        if (searchFieldDDL) searchFieldDDL.value = '';

        document.getElementById('searchInput').value = '';
    }

    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchField = document.getElementById('searchField').value;

    let data = TAB_NAMES.PUTTY;
    if (currentTab === TAB_NAMES.COLOURS)
      data = allDataColours.colours 
    else if (currentTab === TAB_NAMES.EFFECTS) {
      data = allDataEffects.effects;
    }
    else if (currentTab === TAB_NAMES.PROJECTS) {
      data = allDataProjects.projects;
    }    

    if (currentTab === TAB_NAMES.PUTTY) {
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
        const valA = (a[FIELD_KEYS.BASE_COLOUR] || a[FIELD_KEYS.PRODUCT_NAME] || "").toUpperCase();
        const valB = (b[FIELD_KEYS.BASE_COLOUR] || b[FIELD_KEYS.PRODUCT_NAME] || "").toUpperCase();
        
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
}

function displayResults(results = null) {
  if (currentTab === TAB_NAMES.PUTTY) {
      return; 
  }

  let data = "";
  let resultsInfoLabel, resultsContainerLabel = "";

  data = results !== null ? results : (currentTab === TAB_NAMES.COLOURS ? allDataColours.colours : (currentTab === TAB_NAMES.EFFECTS ? allDataEffects.effects : allDataProjects.projects));  
  
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
  tabName = currentTab === TAB_NAMES.COLOURS ? TAB_NAMES.COLOURS : (currentTab === TAB_NAMES.EFFECTS ? TAB_NAMES.EFFECTS : TAB_NAMES.PROJECTS);
  resultsInfo.innerHTML = `<p>${showing} <strong>${data.length}</strong> results</p>`;

  if (currentTab === TAB_NAMES.PROJECTS) {
    resultsContainer.innerHTML = data.map(item => createProjectCard(item)).join('');
  } else {
    resultsContainer.innerHTML = data.map(item => createCard(item)).join('');
    // Apply current primer to all cards after rendering
    applyPrimerToCards(currentPrimerClass);
  }
}

function createCard(item) {
  const mainHex = item[FIELD_KEYS.HEX] || '#ccc';
  const mainContrast = getContrastColor(mainHex);
  const mainSpecialClass = getSpecialClass(mainHex);


    let cardHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${escapeHtml((item[FIELD_KEYS.BASE_COLOUR] || item[FIELD_KEYS.PRODUCT_NAME] || item[FIELD_KEYS.PROJECT_NAME] || '').toUpperCase())}</span>          
          <span class="card-hex ${mainSpecialClass}" style="background-color: ${mainHex}; color: ${mainContrast}" onclick="copyToClipboard('${mainHex}', event)"
      title="Clique para copiar HEX">
            ${escapeHtml(item[FIELD_KEYS.HEX]?.toUpperCase() || item[FIELD_KEYS.STATUS] || '')}
          </span>
        </div>
        <span class="card-code">${escapeHtml((item[FIELD_KEYS.CODE] || '').toUpperCase())}</span>        
    `;

  const hexColor = item[FIELD_KEYS.HEX] || '#ccc';

  if (currentTab != TAB_NAMES.PROJECTS) {
  cardHTML += `
      <div class="dilution-container">
          <div class="dilution-rule ${mainSpecialClass}" style="--paint-color: ${hexColor};"></div>
          <div class="dilution-disclaimer">${escapeHtml(illustrative)}</div>
      </div>
  `;
  }
  
    Object.entries(item).forEach(([key, value]) => {
      // Skip these fields - they're handled separately or already displayed
      if (key === FIELD_KEYS.BASE_COLOUR || key === FIELD_KEYS.CODE || key === FIELD_KEYS.KEYWORDS || key === FIELD_KEYS.PRODUCT_NAME || key === FIELD_KEYS.HEX || key === FIELD_KEYS.OWNED || key === FIELD_KEYS.PROJECT_NAME || key === FIELD_KEYS.STATUS || key === FIELD_KEYS.COMPLEMENTARY) return;

      let displayValue = value;
      let displayKey = key.replace(/\s*\(.*/, "");
      
      cardHTML += `
        <div class="card-field">
          <div class="card-label">${escapeHtml(displayKey)}</div>
          <div class="card-value">${escapeHtml(displayValue?.toString() || '')}</div>
        </div>
        
      `;    
    });
    
    // Handle Complementary field separately to preserve HTML structure with escaped data
    if (item[FIELD_KEYS.COMPLEMENTARY]) {
      const compValue = item[FIELD_KEYS.COMPLEMENTARY];
      if (compValue && compValue.trim() !== "") {
        const compHex = colorMap[compValue.toUpperCase()];
        if (compHex) {
          const compContrast = getContrastColor(compHex);
          const compSpecialClass = getSpecialClass(compHex);
          cardHTML += `
            <div class="card-field">
              <div class="card-label">${escapeHtml(FIELD_KEYS.COMPLEMENTARY)}</div>
              <div class="card-value">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${escapeHtml(compValue)}</span>
                  <span class="card-code ${compSpecialClass}" 
                        style="background-color: ${compHex}; color: ${compContrast}; 
                              padding: 2px 8px; font-size: 0.7rem; border: 1px solid rgba(0,0,0,0.1);">
                    ${escapeHtml(compHex)}
                  </span>
                </div>
              </div>
            </div>
          `;
        } else {
          cardHTML += `
            <div class="card-field">
              <div class="card-label">${escapeHtml(FIELD_KEYS.COMPLEMENTARY)}</div>
              <div class="card-value">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${escapeHtml(compValue)}</span>
                  <span style="font-size: 0.7rem; color: #999; border: 1px solid #ccc; padding: 2px 5px; border-radius: 3px;">
                    Hex N/A
                  </span>
                </div>
              </div>
            </div>
          `;
        }
      }
    }
     
     cardHTML += `
        <div class="card-keywords">${escapeHtml(item[FIELD_KEYS.KEYWORDS] || '')}</div>
      `;    

    cardHTML += `</div>`;
    return cardHTML;  
}

function createProjectCard(item) {  
    const isInProgress = item[FIELD_KEYS.STATUS] && (item[FIELD_KEYS.STATUS].toLowerCase().trim() === 'in progress' || item[FIELD_KEYS.STATUS].toLowerCase().trim() === 'to do');
    const buttonClass = isInProgress ? "accordion-button" : "accordion-button collapsed";
    const bodyStyle = isInProgress ? 'style="display: block;"' : 'style="display: none;"';
    const statusClass = getStatusClass(item[FIELD_KEYS.STATUS]);

    let urlLine = "";
    if (item[FIELD_KEYS.URL] && isValidUrl(item[FIELD_KEYS.URL])) {
        urlLine = `
          <div class="project-more-info">
            <span class="info-label">✨ More information:</span>
            <a href="${item[FIELD_KEYS.URL]}" target="_blank" rel="noopener noreferrer" class="project-link">
              Read full project log <i class="bi bi-box-arrow-up-right" style="font-size: 0.75rem; margin-left: 4px;"></i>
            </a>
          </div>
        `;
    }

    let cardHTML = `
      <div class="projects-accordion">
        <div class="accordion-item backend-border">
          <button class="${buttonClass}" type="button" onclick="toggleAccordion(this)">
            <div class="project-header-main">
              <span class="project-title">${escapeHtml((item[FIELD_KEYS.PROJECT_NAME] || '').toUpperCase())}</span>
              <div class="project-badges">
                <span class="badge ${statusClass}">${escapeHtml((item[FIELD_KEYS.STATUS] || '').toUpperCase())}</span>
                <span class="badge project-pct">${escapeHtml((item[FIELD_KEYS.PCT] || '0%').toUpperCase())}</span>
              </div>
            </div>
          </button>

          <div class="accordion-body" ${bodyStyle}>
            <p class="project-desc">${item[FIELD_KEYS.DESCRIPTION] || ''}</p>   
            ${urlLine}       
    `;
      

    if (item[FIELD_KEYS.MATERIALS] && typeof item[FIELD_KEYS.MATERIALS] === 'object') {
    cardHTML += `<div class="project-dependencies-grid">`;
    Object.entries(item[FIELD_KEYS.MATERIALS]).forEach(([subKey, subArray]) => {
        if (Array.isArray(subArray) && subArray.length > 0) {
            
            // Dicionário para traduzir ou enriquecer o nome da coluna no ecrã
            const displayTitles = {
                "Colours": "Colours",
                "Effects": "Effects",
                "Putty": "Putty",
                "Tools": "Tools & Materials" // Altera aqui para o nome que preferir!
            };

            // Se a subKey existir no dicionário, usa o nome bonito. Se não, usa a própria chave.
            const columnTitle = displayTitles[subKey] || subKey;

            cardHTML += `
              <div class="dep-column">
                <h5>${columnTitle.toUpperCase()}</h5> <div class="dep-mini-list">
            `;
            subArray.forEach(id => {
                const details = getMaterialDetails(subKey, id);
                const borderStyle = `style="border-left: 4px solid ${details.hex};"`;
                cardHTML += `
                    <span class="mini-chip" ${borderStyle}>
                        <small style="color: #888; font-size: 0.75rem; display:block;">${escapeHtml(id)} ${escapeHtml(details.manufacturer || '')}</small>
                        <strong>${escapeHtml(details.name)}</strong>
                    </span>
                `;
            });
            cardHTML += `</div></div>`;
            }
        });
        cardHTML += `</div>`; 
    }
    
    // --- NOVO CONTAINER DO CARROSSEL DO CANVA ---
    if (item[FIELD_KEYS.PROJECT_IMAGE] && Array.isArray(item[FIELD_KEYS.PROJECT_IMAGE]) && item[FIELD_KEYS.PROJECT_IMAGE].length > 0) {
    cardHTML += `
      <div class="canva-carousel-container" onclick="event.stopPropagation();" style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    // Faz um loop por cada imagem dentro do Array
    item[FIELD_KEYS.PROJECT_IMAGE].forEach(imgName => {
        if (imgName && isValidImageFilename(imgName)) {
            cardHTML += `
                <img src="img/projects/${escapeHtml(imgName)}" alt="Canva Showcase" class="canva-long-strip">
            `;
        }
    });
    
    cardHTML += `</div>`;
    } 
    // Fallback de segurança: Caso o JSON antigo ainda tenha apenas uma string em vez de array
    else if (item[FIELD_KEYS.PROJECT_IMAGE] && typeof item[FIELD_KEYS.PROJECT_IMAGE] === 'string' && isValidImageFilename(item[FIELD_KEYS.PROJECT_IMAGE])) {
        cardHTML += `
          <div class="canva-carousel-container" onclick="event.stopPropagation();">
              <img src="img/projects/${escapeHtml(item[FIELD_KEYS.PROJECT_IMAGE])}" alt="Canva Showcase" class="canva-long-strip">
          </div>
        `;
    }
    
    // FECHO SEGURO DAS TAGS (Garante que o corpo envelopa tudo)
    cardHTML += `
          </div> </div> </div> `; 
    
    return cardHTML;  
}

function getStatusClass(status) {
    if (!status) return 'status-todo';
    
    const s = status.toLowerCase().trim();
    if (s === 'done' || s === 'completed' || s === 'finished') return 'status-done';
    if (s === 'in progress' || s === 'on the bench') return 'status-progress';
    if (s === 'parking lot' || s === 'paused') return 'status-parking';
    
    return 'status-todo'; // Fallback padrão para "To Do"
}

function getMaterialDetails(subKey, id) {
    let name = id; 
    let hex = "#555";
    let manufacturer = "";

    const searchId = id.toUpperCase().trim();

    if (subKey === 'Colours' && allDataColours && allDataColours.colours) {
        const found = allDataColours.colours.find(c => c[FIELD_KEYS.CODE] && c[FIELD_KEYS.CODE].toUpperCase().trim() === searchId);
        if (found) {
            name = found[FIELD_KEYS.BASE_COLOUR] || searchId;
            hex = found[FIELD_KEYS.HEX] || "#555";
            manufacturer = found[FIELD_KEYS.MANUFACTURER] ? `[${found[FIELD_KEYS.MANUFACTURER]}] ` : "";
        }
    } else if (subKey === 'Effects' && allDataEffects && allDataEffects.effects) {
        const found = allDataEffects.effects.find(e => e[FIELD_KEYS.CODE] && e[FIELD_KEYS.CODE].toUpperCase().trim() === searchId);
        if (found) {
            name = found[FIELD_KEYS.PRODUCT_NAME] || searchId;
            hex = found[FIELD_KEYS.HEX] || "#555";
            manufacturer = found[FIELD_KEYS.MANUFACTURER] ? `[${found[FIELD_KEYS.MANUFACTURER]}] ` : "";
        }
    } else if (subKey === 'Tools' && typeof allDataTools !== 'undefined' && allDataTools.tools) {
        const found = allDataTools.tools.find(t => t[FIELD_KEYS.CODE] && t[FIELD_KEYS.CODE].toUpperCase().trim() === searchId);
        if (found) {
            name = found.Name || searchId;
        }
    }

    return { name, hex, manufacturer };
}

function toggleAccordion(button) {
    button.classList.toggle('collapsed');
    const body = button.nextElementSibling;
    
    if (window.getComputedStyle(body).display === "block") {
        body.style.display = "none";
    } else {
        body.style.display = "block";
    }
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

function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
}

function isValidImageFilename(filename) {
  if (!filename || typeof filename !== 'string') return false;
  // Block path traversal attempts and absolute paths
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) return false;
  // Only allow alphanumeric, dots, hyphens, underscores
  const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
  return SAFE_FILENAME_REGEX.test(filename);
}

function showError(message) {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;
  
  const escapedMessage = escapeHtml(message);
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>Error</h3>
      <p>${escapedMessage}</p>
      <p style="font-size: 0.85rem; color: #999; margin-top: 10px;">Check the browser console for more details.</p>
    </div>
  `;
  console.error(`[App Error] ${message}`);
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

function applyPrimerToCards(primerClass) {
  // Update state
  currentPrimerClass = primerClass || 'primer-v-white';
  
  // Get all paint cards
  const cards = document.querySelectorAll('.card');
  
  // Get primer selector container (for label color)
  const primerContainer = document.querySelector('.primer-selector-container');
  
  // List of all possible primer classes for removal
  const allPrimerClasses = [
    'primer-v-white', 'primer-v-yellow-ice', 'primer-v-desert-sand', 'primer-v-dark-yellow',
    'primer-v-silvergrey', 'primer-v-light-grey', 'primer-v-vermilion', 'primer-v-ultramarine',
    'primer-v-nato-green', 'primer-v-chestnut-brown', 'primer-v-oxford-blue', 'primer-v-usmc-green',
    'primer-v-venetian-red', 'primer-v-german-green', 'primer-v-bronze-green', 'primer-v-grey',
    'primer-v-dark-grey', 'primer-v-basalt-grey', 'primer-v-black'
  ];
  
  // Apply new primer to each card
  cards.forEach(card => {
    // Remove all existing primer classes
    allPrimerClasses.forEach(primer => {
      card.classList.remove(primer);
    });
    
    // Add new primer class
    if (primerClass && primerClass.trim() !== '') {
      card.classList.add(primerClass);
    }
  });
  
  // Apply primer class to container to update label color
  if (primerContainer) {
    allPrimerClasses.forEach(primer => {
      primerContainer.classList.remove(primer);
    });
    if (primerClass && primerClass.trim() !== '') {
      primerContainer.classList.add(primerClass);
    }
  }
}

function copyToClipboard(text, event) {
    if (event) event.stopPropagation();

    navigator.clipboard.writeText(text).then(() => {
        const element = event.target;
        const originalText = element.innerText;
        element.innerText = "COPIED!";
        element.style.transform = "scale(1.1)";
        console.log(`✓ Copied to clipboard: ${text}`);
        setTimeout(() => {
            element.innerText = originalText;
            element.style.transform = "scale(1.0)";
        }, 800);
    }).catch(err => {
        console.error('✗ Failed to copy to clipboard:', err);
        alert("Unable to copy HEX code. Please try again.");
    });
}

function exportInventoryToCSV() {
    const ownedColours = allDataColours.colours.filter(colour => colour[FIELD_KEYS.OWNED] === "True" || colour[FIELD_KEYS.OWNED] === true);    
    const ownedEffects = allDataEffects.effects.filter(effects => effects[FIELD_KEYS.OWNED] === "True" || effects[FIELD_KEYS.OWNED] === true);

    if (ownedColours.length === 0 && ownedEffects.length === 0) {
        alert("No items marked as owned in inventory.");
        return;
    }

    let csvContent = "\uFEFF"; 
    csvContent += [FIELD_KEYS.BASE_COLOUR, FIELD_KEYS.CODE].join(",") + "\n";

    ownedColours.forEach(colour => {
        const row = [
            `"${colour[FIELD_KEYS.BASE_COLOUR]}"`, 
            `"${colour[FIELD_KEYS.CODE]}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    ownedEffects.forEach(e => {
        const row = [
            `"${e[FIELD_KEYS.PRODUCT_NAME]}"`, 
            `"${e[FIELD_KEYS.CODE]}"`
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
    [TAB_NAMES.COLOURS]: TAB_NAMES.COLOURS,
    [TAB_NAMES.EFFECTS]: TAB_NAMES.EFFECTS,
    [TAB_NAMES.PUTTY]: TAB_NAMES.PUTTY,
    [TAB_NAMES.PROJECTS]: TAB_NAMES.PROJECTS
  };

  if (tabMap[hash]) {
    setTimeout(() => {
      switchTab(tabMap[hash]);
    }, 10);
  }
}