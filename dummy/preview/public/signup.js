document.addEventListener("DOMContentLoaded", function () {
    async function newAccount() {
        console.log("Pressed!");
        const userInput = document.getElementById("user");
        const emailInput = document.getElementById("email");
        const passInput = document.getElementById("password");
        const confirmInput = document.getElementById("confirm");
        const addressInput = document.getElementById("address");
        //const fnameInput = document.getElementById("fname");
        const pressButton = document.getElementById("press");

        if (userInput && emailInput && pressButton && passInput && confirmInput && addressInput) {
            const username = userInput.value;
            const password = passInput.value;
            const email = emailInput.value;
            const address = addressInput.value;
            console.log(username);
            console.log(password);
            const data = { username, password, email, address };
            /*
                        fetch('api/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ data })
                        }).then(response => {
                            if (response.ok) {
                                console.log(response.status);
                            } else {
                                throw new Error('Unable to Create User');
                            }
                        }).catch(error => {
                            console.error(error);
                        });
                    } else {
                        console.error('Required DOM elements not found');
                    }
                        */
            try {
                // login API here
                const response = await fetch('http://localhost:4000/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password,email,address}),
                });

                if (!response.ok) throw new Error('Login failed');

                const { accessToken, refreshToken } = await response.json();

                // maybe access coloalc
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Redirect to landing page
                flag = 1;
                window.location.href = 'landing.html';
            } catch (error) {
                alert('Invalid login. Please try again.');
                console.error('Error:', error);
            }
        }
    }

    const pressButton = document.getElementById("press");
    if (pressButton) {
        pressButton.addEventListener("click", newAccount);
    } else {
        console.error('Press button not found');
    }
});


