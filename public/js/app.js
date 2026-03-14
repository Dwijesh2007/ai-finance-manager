// Application State
let financialData = {
    salary: 60000,
    monthly_expenses: 35000,
    savings: 300000,
    investments: 200000,
    loans: 100000,
    credit_score: 720
};

let assetChartInstance = null;
let simChartInstance = null;

// Initialize when app loads
function initApp(userData) {
    if (userData) {
        document.getElementById('user-profile').style.display = 'flex';
        document.getElementById('user-email').textContent = userData.email;
        document.getElementById('user-avatar').textContent = userData.email.charAt(0).toUpperCase();
        
        populateForm(financialData);
        updateDashboard(financialData);
    }
}

// Auto-initialize since auth is removed
document.addEventListener('DOMContentLoaded', () => {
    initApp({ email: 'user@example.com' });
});

// Navigation Logic
const navLinks = {
    'nav-dashboard': 'view-dashboard',
    'nav-chat': 'view-chat',
    'nav-simulator': 'view-simulator'
};

Object.keys(navLinks).forEach(navId => {
    document.getElementById(navId).addEventListener('click', (e) => {
        e.preventDefault();
        
        // Active highlight
        document.querySelectorAll('.sidebar nav a').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');

        // Toggle Views
        Object.values(navLinks).forEach(viewId => {
            document.getElementById(viewId).classList.add('hidden');
        });
        document.getElementById(navLinks[navId]).classList.remove('hidden');
        
        // Render charts dynamically if views with canvas enter the screen
        if (navLinks[navId] === 'view-dashboard') renderAssetChart(financialData);
    });
});

// Finance Data Ingestion Form Submission
document.getElementById('finance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newData = {
        salary: Number(document.getElementById('input-salary').value),
        monthly_expenses: Number(document.getElementById('input-expenses').value),
        savings: Number(document.getElementById('input-totalsavings').value),
        investments: Number(document.getElementById('input-investments').value),
        loans: Number(document.getElementById('input-loans').value),
        credit_score: Number(document.getElementById('input-credit').value)
    };
    
    financialData = newData;
    
    // UI Feedback
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.style.opacity = '0.8';
    
    await updateDashboard(financialData);
    
    btn.textContent = 'Saved!';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
    }, 2000);
});

function populateForm(data) {
    document.getElementById('input-salary').value = data.salary;
    document.getElementById('input-expenses').value = data.monthly_expenses;
    document.getElementById('input-totalsavings').value = data.savings;
    document.getElementById('input-investments').value = data.investments;
    document.getElementById('input-loans').value = data.loans;
    document.getElementById('input-credit').value = data.credit_score;
}

// Calculate logic, fetch health score API
async function updateDashboard(data) {
    const netWorth = data.savings + data.investments - data.loans;
    const monthlySavings = data.salary - data.monthly_expenses;

    document.getElementById('val-networth').textContent = `₹${netWorth.toLocaleString()}`;
    document.getElementById('val-savings').textContent = `₹${monthlySavings.toLocaleString()}`;
    document.getElementById('val-debt').textContent = `₹${data.loans.toLocaleString()}`;

    renderAssetChart(data);

    try {
        const response = await fetch('/api/health-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const resData = await response.json();
        
        const scoreEl = document.getElementById('health-score-val');
        scoreEl.textContent = resData.score;
        
        if (resData.score >= 80) scoreEl.style.color = 'var(--accent)';
        else if (resData.score >= 50) scoreEl.style.color = '#eab308'; // Warning Yellow
        else scoreEl.style.color = 'var(--danger)';

        const list = document.getElementById('recommendation-list');
        list.innerHTML = '';
        resData.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Health score API error", err);
    }
}

// Data Visualization via Chart.js
function renderAssetChart(data) {
    const ctx = document.getElementById('assetChart').getContext('2d');
    
    if (assetChartInstance) {
        assetChartInstance.destroy();
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    assetChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Emergency Savings', 'Investments', 'Liabilities/Debt'],
            datasets: [{
                data: [data.savings, data.investments, data.loans],
                backgroundColor: ['#10b981', '#6366f1', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            },
            layout: { padding: 20 }
        }
    });
}

// AI Chat Inteface Handlers
const chatInput = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');

document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user-message-bubble');
    chatInput.value = '';

    const loadingId = 'loading-' + Date.now();
    appendMessage('. . .', 'ai-message-bubble', loadingId);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, financialData })
        });
        const data = await response.json();
        
        document.getElementById(loadingId).remove();
        // Return Field
        appendMessage(data.reply, 'ai-message-bubble');
        
    } catch (err) {
        document.getElementById(loadingId).remove();
        appendMessage('API Error: Could not connect to AI reasoning service.', 'ai-message-bubble text-red-400');
    }
}

function appendMessage(text, className, id = null) {
    const div = document.createElement('div');
    div.className = `max-w-[80%] p-5 rounded-2xl shadow-lg border border-white/10 ${className}`;
    div.textContent = text;
    if (id) div.id = id;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Scenario Simulation Interface
document.getElementById('run-sim-btn').addEventListener('click', async () => {
    const current = document.getElementById('sim-current').value;
    const monthly = document.getElementById('sim-monthly').value;
    const months = document.getElementById('sim-months').value;

    try {
        const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentSavings: current, monthlySavings: monthly, months: months })
        });
        const data = await response.json();
        renderSimChart(data.projection);
    } catch (err) {
        console.error("Simulation error", err);
    }
});

function renderSimChart(projectionData) {
    const ctx = document.getElementById('simChart').getContext('2d');
    
    if (simChartInstance) {
        simChartInstance.destroy();
    }

    const labels = projectionData.map(d => `Month ${d.month}`);
    const values = projectionData.map(d => d.amount);

    simChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Projected Portfolio Value (₹)',
                data: values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}
