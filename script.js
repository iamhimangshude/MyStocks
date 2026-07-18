// --- State & DOM Elements ---
let stocks = [];
let editingId = null;

const form = document.getElementById('stock-form');
const stockIdInput = document.getElementById('stock-id');
const nameInput = document.getElementById('stock-name');
const dateInput = document.getElementById('stock-date');
const qtyInput = document.getElementById('stock-qty');
const buyInput = document.getElementById('stock-buy');
const sellInput = document.getElementById('stock-sell');
const notesInput = document.getElementById('stock-notes');
const btnSave = document.getElementById('btn-save-stock');
const btnCancel = document.getElementById('btn-cancel-edit');

const tbody = document.getElementById('stock-tbody');
const emptyState = document.getElementById('empty-state');
const totalProfitEl = document.getElementById('total-profit');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// --- Initialization ---
function init() {
    loadData();
    renderTable();
    
    // Set default date to today
    dateInput.valueAsDate = new Date();
}

// --- LocalStorage ---
function loadData() {
    const data = localStorage.getItem('myStocks_data');
    if (data) {
        stocks = JSON.parse(data);
    }
}

function saveData() {
    localStorage.setItem('myStocks_data', JSON.stringify(stocks));
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// --- Core Logic ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const stock = {
        id: editingId || generateId(),
        name: nameInput.value.trim().toUpperCase(),
        date: dateInput.value,
        quantity: parseFloat(qtyInput.value) || 0,
        buyPrice: parseFloat(buyInput.value) || 0,
        sellPrice: parseFloat(sellInput.value) || 0,
        notes: notesInput.value.trim()
    };
    
    if (editingId) {
        const index = stocks.findIndex(s => s.id === editingId);
        if (index > -1) stocks[index] = stock;
        resetForm();
    } else {
        stocks.push(stock);
        form.reset();
        dateInput.valueAsDate = new Date();
    }
    
    saveData();
    renderTable();
});

function resetForm() {
    editingId = null;
    form.reset();
    dateInput.valueAsDate = new Date();
    stockIdInput.value = '';
    btnSave.innerHTML = '<i class="ph ph-floppy-disk"></i> Save Stock';
    btnCancel.style.display = 'none';
}

btnCancel.addEventListener('click', resetForm);

function editStock(id) {
    const stock = stocks.find(s => s.id === id);
    if (!stock) return;
    
    editingId = stock.id;
    stockIdInput.value = stock.id;
    nameInput.value = stock.name;
    dateInput.value = stock.date;
    qtyInput.value = stock.quantity;
    buyInput.value = stock.buyPrice;
    sellInput.value = stock.sellPrice || '';
    notesInput.value = stock.notes || '';
    
    btnSave.innerHTML = '<i class="ph ph-pencil-simple"></i> Update Stock';
    btnCancel.style.display = 'inline-flex';
    
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteStock(id) {
    if (confirm('Are you sure you want to delete this stock entry?')) {
        stocks = stocks.filter(s => s.id !== id);
        saveData();
        renderTable();
    }
}

// --- Render & Update UI ---
function renderTable() {
    let filteredStocks = [...stocks];
    
    // 1. Search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredStocks = filteredStocks.filter(s => 
            s.name.toLowerCase().includes(searchTerm) || 
            s.date.includes(searchTerm)
        );
    }
    
    // 2. Sort
    const sortVal = sortSelect.value;
    filteredStocks.sort((a, b) => {
        const profitA = (a.sellPrice ? (a.sellPrice - a.buyPrice) * a.quantity : 0);
        const profitB = (b.sellPrice ? (b.sellPrice - b.buyPrice) * b.quantity : 0);
        
        switch(sortVal) {
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'profit-desc': return profitB - profitA;
            case 'profit-asc': return profitA - profitB;
            default: return 0;
        }
    });
    
    // 3. Render HTML and calculate total
    tbody.innerHTML = '';
    let totalProfit = 0;
    
    if (filteredStocks.length === 0) {
        emptyState.style.display = 'flex';
        tbody.parentElement.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tbody.parentElement.style.display = 'table';
        
        filteredStocks.forEach(stock => {
            const tr = document.createElement('tr');
            
            let profit = 0;
            let profitStr = '-';
            let profitClass = 'profit-zero';
            
            if (stock.sellPrice > 0) {
                profit = (stock.sellPrice - stock.buyPrice) * stock.quantity;
                totalProfit += profit;
                profitStr = (profit > 0 ? '+' : '') + formatCurrency(profit);
                profitClass = profit > 0 ? 'profit-pos' : (profit < 0 ? 'profit-neg' : 'profit-zero');
            }
            
            tr.innerHTML = `
                <td><strong>${stock.name}</strong></td>
                <td>${stock.date}</td>
                <td>${stock.quantity}</td>
                <td>${formatCurrency(stock.buyPrice)}</td>
                <td>
                    <input type="number" class="inline-edit-input" value="${stock.sellPrice || ''}" 
                           placeholder="0.00" onchange="updateInlineSellPrice('${stock.id}', this.value)">
                </td>
                <td class="${profitClass}">${profitStr}</td>
                <td>${stock.notes || '-'}</td>
                <td class="td-actions">
                    <button class="btn-icon edit" onclick="editStock('${stock.id}')" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon delete" onclick="deleteStock('${stock.id}')" title="Delete"><i class="ph ph-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Update Total Profit display
    const totalProfitStr = (totalProfit > 0 ? '+' : '') + formatCurrency(totalProfit);
    totalProfitEl.innerText = totalProfitStr;
    totalProfitEl.className = totalProfit > 0 ? 'positive' : (totalProfit < 0 ? 'negative' : '');
}

// For quick sell price updates from the table
window.updateInlineSellPrice = function(id, val) {
    const stock = stocks.find(s => s.id === id);
    if (stock) {
        stock.sellPrice = parseFloat(val) || 0;
        saveData();
        renderTable();
    }
};

searchInput.addEventListener('input', renderTable);
sortSelect.addEventListener('change', renderTable);


// --- Import / Export ---

// Export to JSON
document.getElementById('btn-export-json').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stocks, null, 2));
    downloadFile(dataStr, "mystocks_export.json");
});

// Export to CSV
document.getElementById('btn-export-csv').addEventListener('click', () => {
    if(stocks.length === 0) return alert("No data to export!");
    const headers = ["ID", "Name", "Date", "Quantity", "Buy Price", "Sell Price", "Notes"];
    const csvRows = [headers.join(',')];
    
    stocks.forEach(s => {
        const row = [
            s.id, s.name, s.date, s.quantity, s.buyPrice, s.sellPrice, `"${(s.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });
    
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
    downloadFile(dataStr, "mystocks_export.csv");
});

// Export to Excel (requires SheetJS)
document.getElementById('btn-export-excel').addEventListener('click', () => {
    if(stocks.length === 0) return alert("No data to export!");
    if(typeof XLSX === 'undefined') return alert("Excel export library not loaded.");
    
    const exportData = stocks.map(s => ({
        ID: s.id,
        Name: s.name,
        Date: s.date,
        Quantity: s.quantity,
        'Buy Price': s.buyPrice,
        'Sell Price': s.sellPrice,
        Notes: s.notes
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MyStocks");
    
    XLSX.writeFile(workbook, "mystocks_export.xlsx");
});

function downloadFile(dataStr, filename) {
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Import
const importInput = document.getElementById('import-file');
importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    
    reader.onload = (event) => {
        try {
            const data = event.target.result;
            
            if (ext === 'json') {
                const importedStocks = JSON.parse(data);
                mergeImportedData(importedStocks);
            } 
            else if (ext === 'csv') {
                const importedStocks = parseCSV(data);
                mergeImportedData(importedStocks);
            }
            else if (ext === 'xlsx' || ext === 'xls') {
                if(typeof XLSX === 'undefined') throw new Error("Excel import library not loaded.");
                const workbook = XLSX.read(data, {type: 'binary'});
                const firstSheet = workbook.SheetNames[0];
                const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
                
                const importedStocks = excelRows.map(row => ({
                    id: row.ID || generateId(),
                    name: row.Name || 'UNKNOWN',
                    date: row.Date || new Date().toISOString().split('T')[0],
                    quantity: parseFloat(row.Quantity) || 0,
                    buyPrice: parseFloat(row['Buy Price']) || 0,
                    sellPrice: parseFloat(row['Sell Price']) || 0,
                    notes: row.Notes || ''
                }));
                mergeImportedData(importedStocks);
            } else {
                alert("Unsupported file format.");
            }
        } catch (err) {
            console.error(err);
            alert("Error importing file. Please ensure it's in the correct format.");
        }
        
        // Reset file input
        importInput.value = '';
    };
    
    if (ext === 'xlsx' || ext === 'xls') {
        reader.readAsBinaryString(file);
    } else {
        reader.readAsText(file);
    }
});

function parseCSV(str) {
    const lines = str.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Match comma separated but ignore commas inside quotes
        const obj = {};
        const currentline = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        
        for (let j = 0; j < headers.length; j++) {
            let val = currentline[j] ? currentline[j].replace(/^"|"$/g, '') : '';
            obj[headers[j]] = val;
        }
        
        result.push({
            id: obj.ID || generateId(),
            name: obj.Name || 'UNKNOWN',
            date: obj.Date || new Date().toISOString().split('T')[0],
            quantity: parseFloat(obj.Quantity) || 0,
            buyPrice: parseFloat(obj['Buy Price']) || 0,
            sellPrice: parseFloat(obj['Sell Price']) || 0,
            notes: obj.Notes || ''
        });
    }
    return result;
}

function mergeImportedData(importedStocks) {
    if(!Array.isArray(importedStocks)) {
        alert("Invalid data format.");
        return;
    }
    
    // Add imported stocks to existing list. 
    // We overwrite if ID matches, else we append.
    importedStocks.forEach(impStock => {
        // basic validation
        if(!impStock.name || !impStock.date) return; 
        
        const existingIdx = stocks.findIndex(s => s.id === impStock.id);
        if (existingIdx > -1) {
            stocks[existingIdx] = impStock;
        } else {
            stocks.push(impStock);
        }
    });
    
    saveData();
    renderTable();
    alert("Import successful!");
}

// Start app
init();
