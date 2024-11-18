/*document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/site.html') {
        var accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            window.location.href = 'login.html';
        }
        else {
            const user_display = document.getElementById("signupchange");
            const cart_display = document.getElementById("cartitemstotal");

            (async () => {
                try {
                    const response = await fetch('http://localhost:3000/posts', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });

                    if (!response.ok) throw new Error('Failed to fetch user data');
                    const userData = await response.json();

                    document.getElementById("signupchange").innerText = userData.username;
                } catch (error) {
                    console.error('Error:', error);
                    localStorage.clear();
                    window.location.href = 'login.html'; //login//
                }
            })();
            document.getElementById("findbooks").addEventListener("click", findBook);
            //document.getElementById("findbooks").addEventListener("keydown", findBook);
            document.getElementById("findbookfield").addEventListener('keydown',(event) => {
                if (event.key === 'Enter') {
                    findBook();
                }
            });
        }
    }
});*/
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/site.html') {
        const accessToken = localStorage.getItem('accessToken');
        const profileDropdown = document.getElementById("profile-dropdown");
        const profileOptions = document.getElementById("profile-options");
        console.log("W are heere");
        if (!accessToken) {
            window.location.href = 'login.html';
        } else {
            // Set up profile name as username and display logout option
            (async () => {
                try {
                    const response = await fetch('http://localhost:3000/posts', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });

                    if (!response.ok) throw new Error('Failed to fetch user data');
                    const userData = await response.json();
                    console.log(userData);
                    document.getElementById("signupchange").innerText = userData.username;

                    // Show profile dropdown when logged in
                    
                    profileDropdown.addEventListener('click', (e) => {
                        e.preventDefault();
                        profileOptions.style.display = profileOptions.style.display === 'none' ? 'block' : 'none';
                    });

                    // Handle Logout
                    document.getElementById("logout").addEventListener("click", () => {
                        localStorage.clear();
                        window.location.href = 'login.html';
                    });
                    document.getElementsByClassName("logo")[0].addEventListener('click', () => {
                        window.location.href = "site.html";
                    });
                    document.getElementById("findbooks").addEventListener("click", findBook);
                    //document.getElementById("findbooks").addEventListener("keydown", findBook);
                    document.getElementById("findbookfield").addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            findBook();
                        }
                    });

                } catch (error) {
                    console.error('Error:', error);
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            })();
        }
    }
});
async function findBook() {
    // Retrieve the access token
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    if (!accessToken) {
        alert("Access token not found. Please log in again.");
        return;
    }

    const finder = document.getElementsByClassName("search-input")[0].value;
    const display_div = document.querySelector(".books-grid");

    if (finder) {
        try {
            const response = await fetch(`http://localhost:3000/products?search=${encodeURIComponent(finder)}&timestamp=${new Date().getTime()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            const data = await response.json();
            console.log(data.books[0]);
            const product = data.books[0];
            display_div.innerHTML = '';
            // Check if data is an array of books or a single book object
            /*
            display_div.innerHTML = `
            <div class="book-card">
                <img src="nava.jpg" alt="Book" class="book-image">
                <h4 class="book-title">${product.product_name}</h4>
                <p class="book-author">${product.author}</p>
                <p class="book-price">$${product.price}</p>
                <button class="add-to-cart-button">Add to Cart</button>
            </div>`;
            */
            document.querySelector(".section-title").textContent = "search result";
            if (data.books.length > 0) {
                data.books.forEach(book => {
                    const bookCard = `
                        <div class="book-card">
                            <img src= 'images/${book.images}' alt="Book" class="book-image">
                            <h4 class="book-title">${book.product_name}</h4>
                            <p class="book-author">${book.author}</p>
                            <p class="book-price">$${book.price}</p>
                             <button onclick="addToCart('${book.product_id}')" class="add-to-cart-button">
                    Add to Cart
                </button>
                        </div>
                    `;
                    display_div.innerHTML += bookCard;
                });
            }

        } catch (error) {
            alert(error.message || 'Book not found');
            console.error('Error:', error);
        }
    } else {
        alert("Please enter a search term.");
    }
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            if (productId) addToCart(productId);
        });
    });
}

async function addToCart(productId) {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    try {
        const response = await fetch('http://localhost:3000/add-to-cart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pid: productId,    // match these parameter names
                quanti: 1
            })
        });

        if (!response.ok) throw new Error('Failed to add to cart');
    } catch (error) {
        alert('Error adding to cart');
        console.error(error);
    }
}

const createOrFetchCart = async () => {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!accessToken) {
        console.error('Access token not found. Please log in.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response:', data);
        return data; // Return data if you need to use it elsewhere
    } catch (error) {
        console.error('Fetch request failed:', error);
    }
};

// Call the function
createOrFetchCart();

document.querySelector(".logo").addEventListener('click', ()=> {
    window.location.href = "site.html";
})