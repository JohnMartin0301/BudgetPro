let allowance = 0;
let transactions = [];
let editingIndex = -1;
let allowanceMonthYear = '';
let expenseChart; 

document.addEventListener('DOMContentLoaded', (event) => {
    loadSavedData();
    updateChart();
});

function showDescription() {
    document.getElementById('about').style.display = 'block';
}

function hideDescription() {
    document.getElementById('about').style.display = 'none';
}

function setAllowance() {
    allowance = parseFloat(document.getElementById('allowance').value);
    allowanceMonthYear = document.getElementById('allowanceDate').value;
    alert('Allowance has been set. Check your summary for budget details.');
    saveCurrentAllowance();
    updateSummary();
    updateChart();
}

function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const currentSpent = transactions.filter(t => t.category === category).reduce((sum, t) => sum + t.amount, 0);
    const categoryLimit = allowance * (category === 'needs' ? 0.5 : category === 'savings' ? 0.3 : 0.2);

    if (currentSpent + amount > categoryLimit) {
        alert(`Warning: Adding this transaction will exceed the limit for ${category}.`);
        return;
    }

    if (editingIndex === -1) {
        const transaction = { description, amount, category, date };
        transactions.push(transaction);
    } else {
        transactions[editingIndex] = { description, amount, category, date };
        editingIndex = -1;
    }

    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('date').value = '';
    updateTransactionList();
    updateSummary();
    saveCurrentAllowance();
    updateChart();
    alert('Transaction added/edited.'); 
}

function editTransaction(index) {
    const transaction = transactions[index];
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('category').value = transaction.category;
    document.getElementById('date').value = transaction.date;
    editingIndex = index;
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateTransactionList();
    updateSummary();
    saveCurrentAllowance();
    updateChart();
    alert('Transaction deleted.');
}

function updateSummary() {
    const needs = transactions.filter(t => t.category === 'needs').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.category === 'savings').reduce((sum, t) => sum + t.amount, 0);
    const wants = transactions.filter(t => t.category === 'wants').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = needs + savings + wants;

    const allowanceMonthYearDisplay = new Date(allowanceMonthYear + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

    document.getElementById('allowanceMonthYear').textContent = allowanceMonthYearDisplay;
    document.getElementById('needs').textContent = `${(allowance * 0.5).toFixed(2)} / ${needs.toFixed(2)}`;
    document.getElementById('savings').textContent = `${(allowance * 0.3).toFixed(2)} / ${savings.toFixed(2)}`;
    document.getElementById('wants').textContent = `${(allowance * 0.2).toFixed(2)} / ${wants.toFixed(2)}`;
    document.getElementById('balance').textContent = `${(allowance - totalSpent).toFixed(2)}`;
}

function updateTransactionList() {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    transactions.forEach((transaction, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${transaction.date} - ${transaction.description} - $${transaction.amount.toFixed(2)} (${transaction.category})`;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit');
        editButton.onclick = () => editTransaction(index);
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTransaction(index);
        
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        transactionList.appendChild(listItem);
    });
}

function saveCurrentAllowance() {
    const data = {
        allowance,
        allowanceMonthYear,
        transactions
    };
    localStorage.setItem('currentAllowance', JSON.stringify(data));
}

function saveData() {
    if (!allowanceMonthYear) {
        alert('Please set an allowance date first.');
        return;
    }
    const data = {
        allowance,
        allowanceMonthYear,
        transactions
    };
    localStorage.setItem(allowanceMonthYear, JSON.stringify(data));
    alert('Data saved successfully!');
}

function resetData() {
    allowance = 0;
    transactions = [];
    editingIndex = -1;
    allowanceMonthYear = '';

    document.getElementById('allowance').value = '';
    document.getElementById('allowanceDate').value = '';
    document.getElementById('viewDate').value = '';
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = 'needs';
    document.getElementById('date').value = '';

    updateSummary();
    updateTransactionList();
    updateChart();

    localStorage.removeItem('currentAllowance'); 
    alert('All data has been reset.');
}


function viewData() {
    const viewDate = document.getElementById('viewDate').value;
    const data = JSON.parse(localStorage.getItem(viewDate));
    if (data) {
        allowance = data.allowance;
        allowanceMonthYear = data.allowanceMonthYear;
        transactions = data.transactions;
        updateSummary();
        updateTransactionList();
        updateChart();
    } else {
        alert('No data found for the specified month and year.');
    }
}

function loadSavedData() {
    const savedAllowance = localStorage.getItem('currentAllowance');
    if (savedAllowance) {
        const data = JSON.parse(savedAllowance);
        allowance = data.allowance;
        allowanceMonthYear = data.allowanceMonthYear;
        transactions = data.transactions;
        updateSummary();
        updateTransactionList();
        updateChart(); 
    }
}

function printData() {
    const viewDate = document.getElementById('viewDate').value;
    const data = JSON.parse(localStorage.getItem(viewDate));
    if (data) {
        const needs = data.transactions.filter(t => t.category === 'needs').reduce((sum, t) => sum + t.amount, 0);
        const savings = data.transactions.filter(t => t.category === 'savings').reduce((sum, t) => sum + t.amount, 0);
        const wants = data.transactions.filter(t => t.category === 'wants').reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = needs + savings + wants;
        const allowanceMonthYearDisplay = new Date(data.allowanceMonthYear + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

        setTimeout(() => {
            const chartImage = expenseChart.toBase64Image();

            const newWindow = window.open('', '', 'width=800,height=600');
            newWindow.document.write('<html><head><title>Print Data</title></head><body>');
            newWindow.document.write(`<h1>Finance Tracker Data for ${allowanceMonthYearDisplay}</h1>`);
            newWindow.document.write(`<p>Allowance: $${data.allowance.toFixed(2)}</p>`);
            newWindow.document.write('<h2>Summary</h2>');
            newWindow.document.write(`<p>Needs: $${(data.allowance * 0.5).toFixed(2)} / $${needs.toFixed(2)}</p>`);
            newWindow.document.write(`<p>Savings: $${(data.allowance * 0.3).toFixed(2)} / $${savings.toFixed(2)}</p>`);
            newWindow.document.write(`<p>Wants: $${(data.allowance * 0.2).toFixed(2)} / $${wants.toFixed(2)}</p>`);
            newWindow.document.write(`<p>Balance: $${(data.allowance - totalSpent).toFixed(2)}</p>`);

            newWindow.document.write('<h2>Expense Chart</h2>');
            newWindow.document.write(`<img src="${chartImage}" alt="Expense Chart"/>`);

            newWindow.document.write('<h2>Transactions</h2>');
            newWindow.document.write('<ul>');
            data.transactions.forEach(transaction => {
                newWindow.document.write(`<li>${transaction.date} - ${transaction.description} - $${transaction.amount.toFixed(2)} (${transaction.category})</li>`);
            });
            newWindow.document.write('</ul>');
            newWindow.document.write('</body></html>');
            newWindow.document.close();
            newWindow.print();
        }, 1000); 
    } else {
        alert('No data found for the specified month and year.');
    }
}

function updateChart() {
    const needs = transactions.filter(t => t.category === 'needs').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.category === 'savings').reduce((sum, t) => sum + t.amount, 0);
    const wants = transactions.filter(t => t.category === 'wants').reduce((sum, t) => sum + t.amount, 0);

    const ctx = document.getElementById('expenseChart').getContext('2d');

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Needs', 'Savings', 'Wants'],
            datasets: [{
                label: 'Expenses',
                data: [needs, savings, wants],
                backgroundColor: [
                    'rgba(0, 121, 255, 0.2)',
                    'rgba(0, 223, 162, 0.2)',
                    'rgba(218, 0, 55, 0.2)'
                ],
                borderColor: [
                    'rgba(0, 121, 255, 1)',
                    'rgba(0, 223, 162, 1)',
                    'rgba(218, 0, 55, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}