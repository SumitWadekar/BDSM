document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/site.html') {
        var accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            window.location.href = 'site.html';
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
           document.querySelector(".section-title").textContent="search result";
            if (data.books.length>0) {
                data.books.forEach(book => {
                    const bookCard = `
                        <div class="book-card">
                            <img src= 'nava.jpg' alt="Book" class="book-image">
                            <h4 class="book-title">${book.product_name}</h4>
                            <p class="book-author">${book.author}</p>
                            <p class="book-price">$${book.price}</p>
                            <button class="add-to-cart-button" data-product-id="${book.product_id}">Add to Cart</button>
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
