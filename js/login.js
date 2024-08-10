function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    const rememberMe =document.getElementById('remember-me').checked;

    if (!validateEmail(email)) {
        displayError("Invalid email format");
        return;
    }

    if (!password) {
        displayError("Password cannot be empty");
        return;
    }

    // Clear previous error message
    errorMessage.style.display = 'none';

    fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password,remember_me:rememberMe })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            window.location.href = '../pages/dashboard.html';
        } else {
            displayError("Invalid credentials. Please try again.");
        }
    })
    .catch(error => {
        displayError("An error occurred. Please try again later.");
        console.error("Error:", error);
    });
}
function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Scroll to the error message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add a shake animation
    errorMessage.classList.add('shake');
    
    // Remove the shake class after the animation completes
    setTimeout(() => {
        errorMessage.classList.remove('shake');
    }, 500);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
