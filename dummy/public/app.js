if (window.location.pathname === '/public/index.html' && localStorage.getItem('accessToken')) {
    window.location.href = 'landing.html';
}
var flag=0;
// form submission for login
document.getElementById("press")?.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // login API here
        const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const { accessToken, refreshToken } = await response.json();
        
        // maybe access coloalc
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Redirect to landing page
        flag=1;
        window.location.href = 'landing.html';
    } catch (error) {
        alert('Invalid login. Please try again.');
        console.error('Error:', error);
    }
});

// DOM CONTENT CAUSE WHY NOT
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/landing.html') {
        var accessToken = localStorage.getItem('accessToken');
        if (!accessToken) window.location.href = 'index.html';

        (async () => {
            try {
                const response = await fetch('http://localhost:3000/posts', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (!response.ok) throw new Error('Failed to fetch user data');
                const userData = await response.json();

                document.getElementById('username').innerText = userData.username;
                document.getElementById('user-name').innerText = userData.username;
                document.getElementById('message').innerText = userData.message;
            } catch (error) {
                console.error('Error:', error);
                localStorage.clear();
                window.location.href = 'index.html';
            }
        })();
    }
});
document.getElementById("logout").addEventListener("click",logout);
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

document.getElementById("dummy").addEventListener("click",()=>{
    console.log("adasd");
})
