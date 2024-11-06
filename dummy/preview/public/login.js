document.addEventListener("DOMContentLoaded", function () {
    async function handleLogin(event) {
        event.preventDefault(); // Prevent form submission
        
        const userInput = document.getElementById("userlogin");
        const passInput = document.getElementById("userpass");
        
        if (!userInput || !passInput) {
            console.error('Required form fields not found');
            return;
        }

        const username = userInput.value.trim();
        const password = passInput.value.trim();

        // Basic validation
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            const { accessToken, refreshToken } = data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            window.location.href = 'site.html';
        } catch (error) {
            alert(error.message || 'Invalid login. Please try again.');
            console.error('Error:', error);
        }
    }

    // Add form submit event listener
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // Also add click event listener for backward compatibility
    const loginButton = document.getElementById("login");
    if (loginButton) {
        loginButton.addEventListener("click", handleLogin);
    }
});