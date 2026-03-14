function calculateHealthScore(data) {
    const {
        salary = 0,
        monthly_expenses = 0,
        savings = 0,
        investments = 0,
        loans = 0,
        credit_score = 0
    } = data;

    let score = 100;
    const recommendations = [];

    // 1. Emergency Fund (ideal: 6 months of expenses)
    const emergencyNeeded = monthly_expenses * 6;
    if (savings < emergencyNeeded) {
        score -= 20;
        recommendations.push("Increase your emergency fund to cover at least 6 months of living expenses.");
    } else {
        recommendations.push("Great job! You have a solid emergency fund.");
    }

    // 2. Debt-to-Income Ratio (ideal: < 36%)
    const approximateMonthlyDebtPayment = loans * 0.05;
    const dti = (approximateMonthlyDebtPayment / salary) * 100;
    if (dti > 36) {
        score -= 20;
        recommendations.push("Your debt-to-income ratio is high. Focus on paying down high-interest loans.");
    }

    // 3. Savings Rate (ideal: > 20%)
    const savingsRate = ((salary - monthly_expenses) / salary) * 100;
    if (savingsRate < 20) {
        score -= 15;
        recommendations.push("Try to increase your savings rate to at least 20% of your income.");
    }

    // 4. Credit Score (ideal: > 700)
    if (credit_score < 700) {
        score -= 10;
        recommendations.push("Work on improving your credit score to access better interest rates.");
    }

    return {
        score: Math.max(0, score),
        recommendations,
        metrics: {
            savingsRate: savingsRate.toFixed(1),
            emergencyFundRatio: ((savings / emergencyNeeded) * 100).toFixed(1)
        }
    };
}

function calculateSimulation(currentSavings, monthlySavings, months) {
    let projection = [];
    let current = Number(currentSavings);
    let ms = Number(monthlySavings);
    
    // Assume 5% annual return on investments/savings for demo
    for (let i = 1; i <= months; i++) {
        current += ms;
        current += current * (0.05 / 12); // monthly interest
        projection.push({ month: i, amount: Math.round(current) });
    }
    return projection;
}

module.exports = { calculateHealthScore, calculateSimulation };
