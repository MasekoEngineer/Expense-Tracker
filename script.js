class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('expenseTrackerTransactions')) || [];
        this.currentFilter = 'all';
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
    }
    
    initializeElements() {
        this.balanceAmount = document.querySelector('.balance-amount');
        this.incomeAmount = document.querySelector('.income-amount');
        this.expenseAmount = document.querySelector('.expense-amount');
        this.transactionsList = document.getElementById('transactionsList');
        this.expenseForm = document.querySelector('.expense-form');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.dateInput = document.getElementById('date');
        
        // Set default date to today
        this.dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    attachEventListeners() {
        this.expenseForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterChange(e));
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        
        if (!description || !amount || !date) {
            alert('Please fill in all required fields');
            return;
        }
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date
        };
        if(category.value==="other"){
            document.getElementById('additional').removeAttribute('hidden');
        }
        
        this.addTransaction(transaction);
        this.expenseForm.reset();
        this.dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        e.target.classList.add('active');
        this.currentFilter = filter;
        this.updateTransactionsList();
    }
    
    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.saveToLocalStorage();
        this.updateUI();
    }
    
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToLocalStorage();
        this.updateUI();
    }
    
    calculateSummary() {
        const income = this.transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((total, transaction) => total + transaction.amount, 0);
            
        const expenses = this.transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((total, transaction) => total + transaction.amount, 0);
            
        const balance = income - expenses;
        
        return { balance, income, expenses };
    }
    
    updateSummary() {
        const { balance, income, expenses } = this.calculateSummary();
        
        this.balanceAmount.textContent = `$${balance.toFixed(2)}`;
        this.incomeAmount.textContent = `$${income.toFixed(2)}`;
        this.expenseAmount.textContent = `$${expenses.toFixed(2)}`;
    }
    
    updateTransactionsList() {
        let filteredTransactions = this.transactions;
        
        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(
                transaction => transaction.type === this.currentFilter
            );
        }
        
        if (filteredTransactions.length === 0) {
            this.transactionsList.innerHTML = `
                <div class="empty-state">
                    <p>No ${this.currentFilter === 'all' ? '' : this.currentFilter} transactions found.</p>
                </div>
            `;
            return;
        }
        
        this.transactionsList.innerHTML = filteredTransactions
            .map(transaction => this.createTransactionHTML(transaction))
            .join('');
            
        // Attach event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.transaction-item').dataset.id);
                this.deleteTransaction(id);
            });
        });
    }
    
    createTransactionHTML(transaction) {
        const formattedDate = new Date(transaction.date).toLocaleDateString();
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountSign = transaction.type === 'income' ? '+' : '-';
        
        return `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${formattedDate}</span>
                        <span class="transaction-category">${transaction.category}</span>
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountSign}$${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="btn btn-danger delete-btn">Delete</button>
                </div>
            </div>
        `;
    }
    
    updateUI() {
        this.updateSummary();
        this.updateTransactionsList();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
    }
}

// Initialize the expense tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseTracker();
});