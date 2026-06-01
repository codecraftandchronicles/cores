/**
 * Data Service Layer - Centralized data management for the application
 * Provides a clean API for data operations and separates concerns from UI logic
 * @namespace DataService
 */
const DataService = (function() {
    let coloursData = { colours: [] };
    let effectsData = { effects: [] };
    let projectsData = { projects: [] };
    let toolsData = { tools: [] };
    
    // Private validation functions
    function validateColourData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure: Expected object');
        }
        if (!Array.isArray(data.colours)) {
            throw new Error('Invalid data structure: colours should be an array');
        }
        
        data.colours.forEach((colour, index) => {
            if (!colour || typeof colour !== 'object') {
                throw new Error(`Invalid colour entry at index ${index}: Expected object`);
            }
            
            // Normalize Owned field to boolean
            if (colour.hasOwnProperty('Owned')) {
                colour.Owned = colour.Owned === "True" || colour.Owned === true || colour.Owned === "true";
            }
        });
        
        return true;
    }
    
    function validateEffectsData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure: Expected object');
        }
        if (!Array.isArray(data.effects)) {
            throw new Error('Invalid data structure: effects should be an array');
        }
        
        data.effects.forEach((effect, index) => {
            if (!effect || typeof effect !== 'object') {
                throw new Error(`Invalid effect entry at index ${index}: Expected object`);
            }
            
            // Normalize Owned field to boolean
            if (effect.hasOwnProperty('Owned')) {
                effect.Owned = effect.Owned === "True" || effect.Owned === true || effect.Owned === "true";
            }
        });
        
        return true;
    }
    
    function validateProjectsData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure: Expected object');
        }
        if (!Array.isArray(data.projects)) {
            throw new Error('Invalid data structure: projects should be an array');
        }
        
        data.projects.forEach((project, index) => {
            if (!project || typeof project !== 'object') {
                throw new Error(`Invalid project entry at index ${index}: Expected object`);
            }
            
            if (!project.ProjectName) {
                console.warn(`Project at index ${index} missing ProjectName`);
                project.ProjectName = `Unnamed Project ${index}`;
            }
            
            if (!project.Status) {
                console.warn(`Project at index ${index} missing Status, defaulting to 'to do'`);
                project.Status = 'to do';
            }
        });
        
        return true;
    }
    
    // Public API
    return {
        getColours: function() {
            return coloursData.colours;
        },
        
        getEffects: function() {
            return effectsData.effects;
        },
        
        getProjects: function() {
            return projectsData.projects;
        },
        
        getTools: function() {
            return toolsData.tools;
        },
        
                loadColours: function() {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            return fetch(`./data/colours.json?v=1.0.0`, { signal: controller.signal })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out after 10 seconds');
                    }
                    throw error;
                })
                .then(data => {
                    validateColourData(data);
                    coloursData = data;
                    return coloursData;
                });
        },
        
                loadEffects: function() {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            return fetch(`./data/effects.json?v=1.0.0`, { signal: controller.signal })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out after 10 seconds');
                    }
                    throw error;
                })
                .then(data => {
                    validateEffectsData(data);
                    effectsData = data;
                    return effectsData;
                });
        },
        
                loadProjects: function() {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            return fetch(`./data/projects.json?v=1.0.0`, { signal: controller.signal })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out after 10 seconds');
                    }
                    throw error;
                })
                .then(data => {
                    validateProjectsData(data);
                    projectsData = data;
                    return projectsData;
                });
        },
        
                loadTools: function() {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            return fetch(`./data/tools.json?v=1.0.0`, { signal: controller.signal })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out after 10 seconds');
                    }
                    throw error;
                })
                .then(data => {
                    if (data.tools) {
                        toolsData = data;
                    }
                    return toolsData;
                });
        },
        
        getDataByTab: function(tab) {
            switch(tab) {
                case 'colours': return this.getColours();
                case 'effects': return this.getEffects();
                case 'projects': return this.getProjects();
                case 'tools': return this.getTools();
                default: return [];
            }
        }
    };
})();

// Current application state
let currentTab = 'colours';
let sortAsc = true;
let currentFilteredResults = []; 
let searchField = "Select field...", noResults = "No results found", showing = "Showing", illustrative = "Illustrative", noResultsContainer = "No results", resultsLabel = "Results", headerLabel = "Search", headerParagraph = "Enter search criteria";
let currentTabOperation = null;
let lastTabSwitchTime = 0;
let searchDebounceTimeout = null; // Global debounce timeout
const TAB_SWITCH_DEBOUNCE = 300; // ms
const fieldsToIgnoreEN = ['Hex', 'Role of Complementary', 'Complementary', 'Temperature','Phase','Saturation Level', 'Manufacturer', 'Owned'];
let colorMap = {};

// Legacy global variables (kept for backward compatibility during transition)
let allDataColours = { colours: [] };
let allDataEffects = { effects: [] };
let allDataProjects = { projects: [] };
let allDataTools = { tools: [] };
const configFiltros = {    
    'EN': {
        'colours': {
            'Temperature': ['Warm', 'Cold', 'Neutral'],
            'Phase': ['Base', 'Shadow', 'Highlight', 'Filter', 'Fluorescent', 'TMM'],
            'Saturation': ['Light', 'Medium', 'Dark'],
            'Manufacturer': ['AK', 'Citadel', 'Vallejo']
        },
        'effects': {
            'Manufacturer': ['AK', 'Citadel', 'Vallejo']
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

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    showError(`An unexpected error occurred: ${escapeHtml(event.error.message)}`);
    
    // Prevent default browser error handling
    event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError(`An unexpected error occurred: ${escapeHtml(event.reason.message || String(event.reason))}`);
    
    // Prevent default browser error handling
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', async () => {
  await PageLoad();
  setupEventListeners();  
  syncTabWithHash(); 
});

/**
 * Initializes the application by loading all data and setting up the UI
 * @async
 * @function PageLoad
 * @returns {Promise<void>}
 */
async function PageLoad() {  
  const loader = document.getElementById('loading-overlay');
  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }
  
  try {
    // Use DataService for all data loading
    const loadOperations = [
      DataService.loadColours(),
      DataService.loadEffects(),
      DataService.loadProjects(),
      DataService.loadTools()
    ];
    
    // Load all data in parallel
    await Promise.all(loadOperations);
    
    // Update legacy globals for backward compatibility
    allDataColours = { colours: DataService.getColours() };
    allDataEffects = { effects: DataService.getEffects() };
    allDataProjects = { projects: DataService.getProjects() };
    allDataTools = { tools: DataService.getTools() };
    
    // Initialize UI after data is loaded
    buildColorMap();
    updateSearchFields();
    updateFilters();
    displayResults();
    
  } catch (error) {
    console.error('Failed to load application data:', error);
    showError(`Failed to load application data: ${escapeHtml(error.message)}`);
  } finally {
    // Always hide loader when done
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }
}

function validateColourData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure: Expected object');
    }
    if (!Array.isArray(data.colours)) {
        throw new Error('Invalid data structure: colours should be an array');
    }
    
    // Validate each colour entry
    data.colours.forEach((colour, index) => {
        if (!colour || typeof colour !== 'object') {
            throw new Error(`Invalid colour entry at index ${index}: Expected object`);
        }
        
        // Normalize Owned field to boolean
        if (colour.hasOwnProperty('Owned')) {
            colour.Owned = colour.Owned === "True" || colour.Owned === true || colour.Owned === "true";
        }
    });
    
    return true;
}

function loadData(endpoint, dataKey, sortField, globalName, customSort = null) {
  const loader = document.getElementById('loading-overlay');
  if (loader && endpoint === 'colours') {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }

    fetch(`./data/colours.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            try {
                // Validate data structure
                validateColourData(data);
                
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
            } catch (validationError) {
                console.error('Data validation failed:', validationError.message);
                showError(`Data validation failed: ${validationError.message}`);
                if (loader) loader.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Failed to load colours data:', err.message);
            showError(`Failed to load colours data: ${err.message}`);
            if (loader) loader.style.display = 'none';
        });
}

function validateEffectsData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure: Expected object');
    }
    if (!Array.isArray(data.effects)) {
        throw new Error('Invalid data structure: effects should be an array');
    }
    
    // Validate each effect entry
    data.effects.forEach((effect, index) => {
        if (!effect || typeof effect !== 'object') {
            throw new Error(`Invalid effect entry at index ${index}: Expected object`);
        }
        
        // Normalize Owned field to boolean
        if (effect.hasOwnProperty('Owned')) {
            effect.Owned = effect.Owned === "True" || effect.Owned === true || effect.Owned === "true";
        }
    });
    
    return true;
}

function loadDataEffects(lang) {
    const chaveNome = "Base Colour";

    fetch(`./data/effects.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {                        
            try {
                // Validate data structure
                validateEffectsData(data);
                
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
            } catch (validationError) {
                console.error('Data validation failed:', validationError.message);
                showError(`Data validation failed: ${validationError.message}`);
            }
        })
        .catch(err => {
            console.error('Failed to load effects data:', err.message);
            showError(`Failed to load effects data: ${err.message}`);
        });
}

function validateProjectsData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure: Expected object');
    }
    if (!Array.isArray(data.projects)) {
        throw new Error('Invalid data structure: projects should be an array');
    }
    
    // Validate each project entry
    data.projects.forEach((project, index) => {
        if (!project || typeof project !== 'object') {
            throw new Error(`Invalid project entry at index ${index}: Expected object`);
        }
        
        // Ensure required fields exist
        if (!project.ProjectName) {
            console.warn(`Project at index ${index} missing ProjectName`);
            project.ProjectName = `Unnamed Project ${index}`;
        }
        
        if (!project.Status) {
            console.warn(`Project at index ${index} missing Status, defaulting to 'to do'`);
            project.Status = 'to do';
        }
    });
    
    return true;
}

function loadDataProjects() {
    fetch(`./data/projects.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid content type: Expected application/json');
            }
            
            return response.json();
        })
        .then(data => {                        
            try {
                // Validate data structure
                validateProjectsData(data);
                
                if (data.projects) {
                    const statusPriority = {
                        "to do": 1,
                        "in progress": 2,
                        "on the bench": 2,
                        "done": 3,
                        "completed": 3,
                        "parking lot": 4
                    };

                    data.projects.sort((a, b) => {
                        const statusA = (a["Status"] || "").toLowerCase().trim();
                        const statusB = (b["Status"] || "").toLowerCase().trim();

                        const priorityA = statusPriority[statusA] || 99;
                        const priorityB = statusPriority[statusB] || 99;

                        if (priorityA !== priorityB) {
                            return priorityA - priorityB;
                        } 
                        
                        if (statusA === "done" || statusA === "completed") {
                            const dateA = parseDate(a["FinishDate"]);
                            const dateB = parseDate(b["FinishDate"]);
                            return dateB - dateA; 
                        }

                        const nomeA = (a["ProjectName"] || "").toUpperCase();
                        const nomeB = (b["ProjectName"] || "").toUpperCase();
                        return nomeA.localeCompare(nomeB);
                    });
                }

                allDataProjects = data;
                buildColorMap(); 
                updateSearchFields(); 
                updateFilters(); 
                displayResults();
            } catch (validationError) {
                console.error('Data validation failed:', validationError.message);
                showError(`Data validation failed: ${validationError.message}`);
            }
        })
        .catch(err => {
            console.error('Failed to load projects data:', err.message);
            
            // Provide more specific error messages
            if (err.message.includes('HTTP error! status:')) {
                showError(`Failed to load projects data. Server returned error: ${err.message}`);
            } else if (err.message.includes('Invalid content type')) {
                showError('Failed to load projects data. Invalid data format received.');
            } else if (err.message.includes('JSON.parse')) {
                showError('Failed to load projects data. Corrupted or invalid JSON.');
            } else {
                showError(`Failed to load projects data: ${err.message}`);
            }
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

function loadDataTools() {
    fetch(`./data/tools.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {                        
            if (data.tools) {
                data.tools.sort((a, b) => {
                    const nomeA = (a["Name"] || "").toUpperCase();
                    const nomeB = (b["Name"] || "").toUpperCase();
                    return nomeA.localeCompare(nomeB);
                });
            }

            allDataTools = data;
            buildColorMap(); 
            updateSearchFields(); 
            updateFilters(); 
            displayResults();
        })
        .catch(err => {
            console.error('Failed to load tools data:', err.message);
            showError(`Failed to load tools data: ${err.message}`);
        });
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




    // Debounced search input (using global searchDebounceTimeout)
    document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      validateSearchButton();
      // Only auto-search if we have a search field selected
      const searchField = document.getElementById('searchField').value;
      if (searchField && e.target.value.trim().length > 0) {
        performSearch();
      }
    }, 300); // 300ms debounce delay
  });
  
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchDebounceTimeout);
      performSearch();
    }
  });
  
  // Add event listener for export button
  const exportBtn = document.getElementById('btnInventory');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportInventoryToCSV);
  }
}


function cleanupEventListeners() {
  // Clean up any existing virtual scrolling
  const virtualContainer = document.querySelector('.virtual-scroll-container');
  if (virtualContainer) {
    const viewport = virtualContainer.querySelector('.virtual-scroll-viewport');
    if (viewport) {
      // Clone the node to remove all event listeners
      const newViewport = viewport.cloneNode(true);
      viewport.parentNode.replaceChild(newViewport, viewport);
    }
  }
  
  // Clear any pending timeouts
  if (currentTabOperation) {
    clearTimeout(currentTabOperation);
    currentTabOperation = null;
  }
  
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = null;
  }
  
  // Remove any orphaned event listeners by cloning checkboxes
  document.querySelectorAll('.filter-checkboxes input[type="checkbox"]').forEach(checkbox => {
    const newCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode.replaceChild(newCheckbox, checkbox);
  });
}

function switchTab(tab) {
  // Clean up before switching
  cleanupEventListeners();
  
  // Debounce rapid tab switching to prevent race conditions
  const now = Date.now();
  if (now - lastTabSwitchTime < TAB_SWITCH_DEBOUNCE) {
    // Cancel previous operation if still pending
    if (currentTabOperation) {
      clearTimeout(currentTabOperation);
    }
  }
  lastTabSwitchTime = now;
  
  // Set new operation
  currentTabOperation = setTimeout(() => {
    currentTab = tab;
    const resultsEl = document.getElementById('results');
    const info = document.getElementById('resultsInfo');
    const sortContainer = document.querySelector('.sort-container');
    const searchControls = document.querySelector('.search-controls');

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    window.history.replaceState(null, null, `#${tab}`);
      
    // Reset sort direction when switching tabs
    sortAsc = true;
    const sortBtn = document.getElementById('btn-sort');
    if (sortBtn) {
      sortBtn.classList.remove('desc');
    }
    
    // Clear filter state when switching tabs
    document.querySelectorAll('.filter-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Clear search when switching tabs
    document.getElementById('searchInput').value = '';
    document.getElementById('searchField').value = '';
    validateSearchButton();

    if (tab === 'putty' || tab === 'projects') {
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
      
      // Update UI with cleared state
      updateSearchFields();
      updateFilters();
      displayResults(); 
    }
    
    currentTabOperation = null;
  }, TAB_SWITCH_DEBOUNCE);
}

function updateSearchFields() {
    const fieldSelect = document.getElementById('searchField');
    if (!fieldSelect) return;
    fieldSelect.innerHTML = '';
    
    const dataRef = DataService.getDataByTab(currentTab);
    let fields = [];

    // Array bounds checking
    if (dataRef && Array.isArray(dataRef) && dataRef.length > 0) {
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
    const colours = DataService.getColours();
    if (!colours || colours.length === 0) return;

    const chaveNome = FIELD_KEYS.BASE_COLOUR;
    
    colours.forEach(c => {
        if (c[chaveNome]) {
            // Store both original and normalized versions for better matching
            const colorName = c[chaveNome];
            colorMap[colorName.toUpperCase()] = c["Hex"] || "#ccc";
            
            // Also store normalized version (trimmed, without extra spaces)
            const normalizedName = colorName.trim().replace(/\s+/g, ' ');
            if (normalizedName !== colorName) {
                colorMap[normalizedName.toUpperCase()] = c["Hex"] || "#ccc";
            }
        }
    });
    
    console.log('Color map built with', Object.keys(colorMap).length, 'entries');
}

function extractUniqueValues(fieldName) {
  const data = currentTab === 'colours' ? DataService.getColours() : DataService.getEffects();
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
    
    // Get the correct filter configuration based on current tab
    const tabConfig = currentTab === 'effects' ? configFiltros['EN']['effects'] : configFiltros['EN']['colours'];
    if (!tabConfig) return;

    // Get sample data to check which fields actually exist
    let sampleData = [];
    if (currentTab === 'colours' && allDataColours.colours && allDataColours.colours.length > 0) {
        sampleData = allDataColours.colours;
    } else if (currentTab === 'effects' && allDataEffects.effects && allDataEffects.effects.length > 0) {
        sampleData = allDataEffects.effects;
    }

    Object.keys(tabConfig).forEach(fieldName => {
        const values = tabConfig[fieldName];        
        if (!values || values.length === 0) return;

        // Only show filters for fields that actually exist in the data
        if (sampleData.length > 0 && !sampleData[0].hasOwnProperty(fieldName)) {
            return;
        }

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

    // Escape search term to prevent HTML injection
    const searchInput = document.getElementById('searchInput');
    const rawSearchTerm = searchInput.value.trim();
    const searchTerm = escapeHtml(rawSearchTerm).toLowerCase();
    const searchField = document.getElementById('searchField').value;

    // Validate search field - don't allow empty or whitespace-only searches
    if (searchTerm && searchTerm.length === 0) {
        showError('Please enter a valid search term');
        return;
    }

    let data = 'putty';
    if (currentTab === 'colours')
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
            // Apply filters
            for (const [field, values] of Object.entries(selectedFilters)) {
                const itemValue = item[field];
            
                // Skip this filter if the field doesn't exist in this item
                if (itemValue === undefined || itemValue === null) {
                    continue;
                }
            
                // Handle cases where itemValue might contain multiple values separated by commas or slashes
                const itemValues = String(itemValue).split(/[,\/]/).map(v => v.trim());
                const matches = values.some(filterValue => 
                    itemValues.some(itemVal => itemVal.toLowerCase() === filterValue.toLowerCase())
                );
                if (!matches) return false;
            } 
        
            // Apply search term
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

  const data = results !== null ? results : DataService.getDataByTab(currentTab);  
  
  const resultsContainer = document.getElementById('results');
  const resultsInfo = document.getElementById('resultsInfo');

    // Array bounds checking
  if (!data || !Array.isArray(data) || data.length === 0) {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const searchField = document.getElementById('searchField').value;
    
    let suggestions = [];
    if (searchTerm) {
      suggestions.push(`Check your spelling of "${searchTerm}"`);
    }
    if (searchField) {
      suggestions.push(`Try searching in a different field`);
    }
    suggestions.push(`Try broader search terms`);
    suggestions.push(`Clear filters to see all results`);
    
    const suggestionsHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    
    resultsInfo.innerHTML = `<p>${resultsInfoLabel}</p>`;
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No results found</h3>
        <p>We couldn't find any matches for your search.</p>
        <div class="suggestions">
          <h4>Try these suggestions:</h4>
          <ul>
            ${suggestionsHTML}
          </ul>
        </div>
      </div>
    `;
    return;
  }

  let tabName = "";
  tabName = currentTab === TAB_NAMES.COLOURS ? TAB_NAMES.COLOURS : (currentTab === TAB_NAMES.EFFECTS ? TAB_NAMES.EFFECTS : TAB_NAMES.PROJECTS);
  resultsInfo.innerHTML = `<p>${showing} <strong>${data.length}</strong> results</p>`;

  // Implement virtualization for large datasets
  if (data.length > 50) {
    implementVirtualScrolling(data, resultsContainer);
  } else {
    // For smaller datasets, use traditional rendering
    if (currentTab === 'projects') {
      resultsContainer.innerHTML = data.map(item => createProjectCard(item)).join('');
    } else {
      resultsContainer.innerHTML = data.map(item => createCard(item)).join('');
    }
  }
}

function implementVirtualScrolling(data, container) {
  // Create virtual scroll container
  const virtualContainer = document.createElement('div');
  virtualContainer.className = 'virtual-scroll-container';
  virtualContainer.style.position = 'relative';
  virtualContainer.style.height = `${Math.min(data.length * 380, 5000)}px`; // Max 5000px height
  
  // Create viewport
  const viewport = document.createElement('div');
  viewport.className = 'virtual-scroll-viewport';
  viewport.style.position = 'absolute';
  viewport.style.top = '0';
  viewport.style.left = '0';
  viewport.style.width = '100%';
  viewport.style.height = '100%';
  viewport.style.overflow = 'auto';
  
  // Create content area
  const content = document.createElement('div');
  content.className = 'virtual-scroll-content';
  content.style.position = 'absolute';
  content.style.top = '0';
  content.style.left = '0';
  content.style.width = '100%';
  
  // Calculate visible items
  const itemHeight = 380; // Approximate card height
  const visibleItems = Math.ceil(window.innerHeight / itemHeight) + 2;
  
  // Render initial visible items
  let startIndex = 0;
  let endIndex = Math.min(visibleItems, data.length);
  
  function renderVisibleItems() {
    const scrollTop = viewport.scrollTop;
    const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const newEndIndex = Math.min(data.length, newStartIndex + visibleItems + 2);
    
    // Only re-render if indices changed significantly
    if (Math.abs(newStartIndex - startIndex) > visibleItems/2) {
      startIndex = newStartIndex;
      endIndex = newEndIndex;
      
      // Update content height and position
      content.style.height = `${data.length * itemHeight}px`;
      content.style.transform = `translateY(${startIndex * itemHeight}px)`;
      
      // Render visible items
      const visibleData = data.slice(startIndex, endIndex);
      if (currentTab === 'projects') {
        content.innerHTML = visibleData.map(item => createProjectCard(item)).join('');
      } else {
        content.innerHTML = visibleData.map(item => createCard(item)).join('');
      }
    }
  }
  
  // Initial render
  renderVisibleItems();
  
  // Add scroll event listener with throttling
  let scrollTimeout;
  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(renderVisibleItems, 50);
  });
  
  // Handle resize
  window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(renderVisibleItems, 100);
  });
  
  // Assemble structure
  viewport.appendChild(content);
  virtualContainer.appendChild(viewport);
  container.innerHTML = '';
  container.appendChild(virtualContainer);
  
  // Cleanup function
  return () => {
    window.removeEventListener('resize', renderVisibleItems);
    viewport.removeEventListener('scroll', renderVisibleItems);
  };
}

function createCard(item) {
  if (!item) {
    console.warn('Invalid item data');
    return '';
  }
  
  const mainHex = item['Hex'] || '#ccc';
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

            if (key === 'Complementary') {
        if (!value || value.trim() === "") {
          displayValue = `<span style="color: #999; font-style: italic;">N/A</span>`;
        } else {
          // Try multiple ways to find the complementary color
          let compHex = colorMap[value.toUpperCase()];
          
          // If not found, try normalized version (remove extra spaces, etc.)
          if (!compHex) {
            const normalizedValue = value.trim().replace(/\s+/g, ' ');
            compHex = colorMap[normalizedValue.toUpperCase()];
          }
          
          // Log missing colors for debugging
          if (!compHex) {
            console.warn(`Complementary color not found in colorMap: "${value}"`);
            console.log('Available color keys:', Object.keys(colorMap).slice(0, 10), '...');
          }
          
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
    if (!item) {
        console.warn('Invalid project item data');
        return '';
    }
    
    const isInProgress = item.Status && (item.Status.toLowerCase().trim() === 'in progress' || item.Status.toLowerCase().trim() === 'to do');
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
    item.ProjectImage.forEach((imgName, index) => {
        if (imgName) {
            cardHTML += `
                <img src="img/projects/${imgName}" alt="Canva Showcase" class="canva-long-strip"
                     onerror="this.src='img/placeholder-image.jpg'; this.alt='Image not available';">
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

function validateImagePath(path) {
    if (!path || typeof path !== 'string') {
        console.warn('Invalid image path:', path);
        return false;
    }
    
    // Check if path exists by creating an Image object
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = path;
    });
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

    if (subKey === 'Colours') {
        const colours = DataService.getColours();
        const found = colours.find(c => c.Code && c.Code.toUpperCase().trim() === searchId);
        if (found) {
            name = found[FIELD_KEYS.BASE_COLOUR] || searchId;
            hex = found[FIELD_KEYS.HEX] || "#555";
            manufacturer = found[FIELD_KEYS.MANUFACTURER] ? `[${found[FIELD_KEYS.MANUFACTURER]}] ` : "";
        }
    } else if (subKey === 'Effects') {
        const effects = DataService.getEffects();
        const found = effects.find(e => e.Code && e.Code.toUpperCase().trim() === searchId);
        if (found) {
            name = found[FIELD_KEYS.PRODUCT_NAME] || searchId;
            hex = found[FIELD_KEYS.HEX] || "#555";
            manufacturer = found[FIELD_KEYS.MANUFACTURER] ? `[${found[FIELD_KEYS.MANUFACTURER]}] ` : "";
        }
    } else if (subKey === 'Tools') {
        const tools = DataService.getTools();
        if (tools && tools.tools) {
            const found = tools.tools.find(t => t.ID && t.ID.toUpperCase().trim() === searchId);
            if (found) {
                name = found.Name || searchId;
            }
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
  if (typeof text !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  
  // First escape HTML characters
  let escaped = text.replace(/[&<>"'/]/g, m => map[m]);
  
  // Then remove any potential script tags or event handlers
  escaped = escaped.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  escaped = escaped.replace(/on\w+\s*=/gi, '');
  escaped = escaped.replace(/javascript:/gi, '');
  
  return escaped;
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
  const safeMessage = escapeHtml(message);
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>Error</h3>
      <p>${safeMessage}</p>
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
    // Normalize Owned field to boolean for consistent checking
    const normalizeOwned = (item) => {
        if (item.Owned === undefined || item.Owned === null) return false;
        return item.Owned === "True" || item.Owned === true || item.Owned === "true";
    }; 
    
    const colours = DataService.getColours() || [];
    const effects = DataService.getEffects() || [];
    
    const ownedColours = colours.filter(colour => normalizeOwned(colour)); 
    const ownedEffects = effects.filter(effect => normalizeOwned(effect));

    if (ownedColours.length === 0 && ownedEffects.length === 0) {
        alert("No items marked as owned in inventory.");
        return;
    }

    let csvContent = "\uFEFF"; 
    csvContent += [FIELD_KEYS.BASE_COLOUR, FIELD_KEYS.CODE].join(",") + "\n";

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