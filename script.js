let currentMode = 'PPF';
let debtRate = 7.1;

function setMode(mode) {
    currentMode = mode;
    debtRate = (mode === 'PPF') ? 7.1 : 8.25;
    document.getElementById('ppfBtn').classList.toggle('active', mode === 'PPF');
    document.getElementById('vpfBtn').classList.toggle('active', mode === 'VPF');
    document.getElementById('debtLabel').innerText = mode + " Maturity Value:";
    document.getElementById('results').style.display = 'none';
}

// Error Clearing Listeners from Property Calculator[cite: 8]
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() { 
        formatNumber(this); 
        this.classList.remove('error'); 
        document.getElementById('error-message').style.display = 'none';
    });
});

function formatNumber(input) {
    let value = input.value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, ''); 
    if (value.length > 3) {
        let parts = value.split('.');
        let integer = parts[0];
        let decimal = parts.length > 1 ? '.' + parts[1] : '';
        let lastThree = integer.slice(-3);
        let otherNumbers = integer.slice(0, -3);
        if (otherNumbers) {
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        value = integer + decimal;
    }
    input.value = value;
}

function calculate() {
    const requiredFields = ['contribution', 'sipRate', 'years'];
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');
    let isValid = true;

    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    // Standard Validation[cite: 8]
    requiredFields.forEach(id => {
        const element = document.getElementById(id);
        if (element.value.trim() === "") {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });

    if (!isValid) return;

    const P = parseFloat(document.getElementById('contribution').value.replace(/,/g, ''));
    const sipRate = parseFloat(document.getElementById('sipRate').value.replace(/,/g, ''));
    const years = parseFloat(document.getElementById('years').value.replace(/,/g, ''));

    // Custom "Less than 10" check using the Property Calculator style[cite: 8]
    if (sipRate < 10) {
        errorDiv.innerText = "This value cannot be less than 10.";
        errorDiv.style.display = 'block';
        document.getElementById('sipRate').classList.add('error');
        return;
    }

    const n = years * 12;
    const calculateFV = (p, r, m) => {
        const i = r / 12 / 100;
        return p * ((Math.pow(1 + i, m) - 1) / i) * (1 + i);
    };

    const debtMaturity = calculateFV(P, debtRate, n);
    const sipMaturity = calculateFV(P, sipRate, n);
    const wealth = sipMaturity - debtMaturity;

    displayResults(debtMaturity, sipMaturity, wealth);
}

function displayResults(debt, sip, wealth) {
    const formatToWords = num => {
        const isNeg = num < 0;
        const abs = Math.abs(num);
        const ONE_CRORE = 10000000;
        const ONE_LAKH = 100000;
        let res = "";

        if (abs >= ONE_CRORE) {
            res = `₹${(Math.ceil((abs / ONE_CRORE) * 100) / 100).toFixed(2)} Crore`;
        } else if (abs >= ONE_LAKH) {
            res = `₹${(Math.ceil((abs / ONE_LAKH) * 100) / 100).toFixed(2)} Lakh`;
        } else {
            let int = Math.ceil(abs).toString();
            if (int.length > 3) {
                let last3 = int.slice(-3);
                let others = int.slice(0, -3);
                others = others.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
                int = others + "," + last3;
            }
            res = "₹" + int;
        }
        return isNeg ? "-" + res : res;
    };

    document.getElementById('debtResult').innerText = formatToWords(debt);
    document.getElementById('sipResult').innerText = formatToWords(sip);
    document.getElementById('wealthGained').innerText = formatToWords(wealth);
    document.getElementById('results').style.display = 'block';
}
