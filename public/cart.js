let cartData = []; //global cart deatails nikhil
document.getElementById("Checkout").addEventListener("click", async () => {
    /*
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!accessToken) {
        alert("Access token not found. Please log in again.");
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/checkout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch cart products');
        }
        const data = await response.json();
        console.log(data.message);
       // console.log(data.prodInfo);
    } catch (error) {
        alert(error.message || 'Error fetching cart products');
        console.error('Error:', error);
    }*/
    if (cartData.length > 0) {
        let amount = document.getElementById("Total-amount").innerText;
        amount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0
        console.log(amount);
        debitAmount(amount);
    } else {
        alert("Your cart seems a little empty!");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Store cart data globally for access across functions

    async function showCart() {
        const display_div = document.getElementById("cart");
        display_div.innerHTML = '';
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        try {
            const response = await fetch(`http://localhost:3000/cart_customer`, {
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
            cartData = data.prodInfo; // Save cart data globally

            cartData.forEach((book, index) => {
                const bookCard = `
                    <div class="cart-item">
                        <img src="images/${book.images}" alt="Product Image">
                        <div class="cart-item-details">
                            <div class="cart-item-title">${book.product_name}</div>
                            <div class="cart-item-price">₹${book.price}</div>
                            <div class="cart-item-quantity">
                                <label for="quantity${index}">Qty:</label>
                                <input type="number" id="quantity${index}" min="1" max="10" value="${book.quantity}" class="quantity" data-index="${index}">
                            </div>
                            
                            <button class="cart-item-remove" onclick="removefromCart('${book.product_id}')">
                            Remove
                            </button>
                        </div>
                    </div>
                `;
                display_div.innerHTML += bookCard;
            });

            attachQuantityListeners();
            UpdateItems();
            UpdatePrice();
        } catch (error) {
            alert(error.message || 'Book not found');
            console.error('Error:', error);
        }
    }

    function attachQuantityListeners() {
        const quantityInputs = document.querySelectorAll('.quantity');
        quantityInputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const index = event.target.dataset.index;
                cartData[index].quantity = parseInt(event.target.value) || 1; // Update quantity in cart data
                UpdateItems();
                UpdatePrice();
            });
        });
    }

    function UpdateItems() {
        let total_items = 0;
        cartData.forEach(item => {
            total_items += parseInt(item.quantity);
            //console.log(item);
            addToCart(item.product_id, item.quantity)
        });
        document.getElementById('Total-items').innerText = `${total_items} item/s`;

    }

    function UpdatePrice() {
        let total_price = 0;
        cartData.forEach(item => {
            total_price += parseFloat(item.price) * parseInt(item.quantity);
        });
        document.getElementById('Total-amount').innerText = `Total: ₹${total_price.toFixed(2)}`;
    }

    showCart();
});
async function addToCart(productId, quanti) {
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
                quanti: quanti
            })
        });

        if (!response.ok) throw new Error('Failed to add to cart');
    } catch (error) {
        alert('Error adding to cart');
        console.error(error);
    }
}

async function removefromCart(productId) {
    console.log(productId);
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    try {
        const response = await fetch('http://localhost:3000/remove-from-cart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pid: productId, // match these parameter names
            })
        });

        if (!response.ok) throw new Error('Failed to remove from cart');
        console.log(event);
        window.location.reload();
        // Find the index of the item to be removed
        // const itemIndex = cartData.findIndex(item => item.product_id === productId);
        // console.log(cartData)
        // if (itemIndex > -1) {
        //     // Remove item from cartData array
        //     cartData.splice(itemIndex, 1);

        //     // Update the total items and price
        //     UpdateItems();
        //     UpdatePrice();

        //     // Remove the item div from DOM
        //     const itemDiv = document.querySelector(`.cart-item img[src="images/${cartData[itemIndex].images}"]`).closest('.cart-item');
        //     console.log(itemDiv)
        //     if (itemDiv) {
        //         itemDiv.remove();
        //     }

        //     alert('Removed from cart');
        // }

    } catch (error) {
        alert('Error removing from cart');
        console.error(error);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/cart.html') {
        var accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            window.location.href = 'site.html';
        }
        else {
            const user_display = document.getElementById("profile");
            //const cart_display = document.getElementById("cartitemstotal");

            (async () => {
                try {
                    const response = await fetch('http://localhost:3000/posts', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });

                    if (!response.ok) throw new Error('Failed to fetch user data');
                    const userData = await response.json();

                    document.getElementById("profile").innerText = userData.username;
                } catch (error) {
                    console.error('Error:', error);
                    localStorage.clear();
                    window.location.href = 'cart.html'; //login//
                }
            })();
        }
    }
});

// debit function
async function debitAmount(amount) {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!accessToken) {
        alert("Access token not found. Please log in again.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/debit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount // Pass the amount to debit
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to debit amount');
        }

        const data = await response.json();
        console.log(data.message);
        alert(data.message); // Display the transaction success message

        window.location.href ='transaction.html';
        cartData.forEach(item => {
            
            addToCart(item.product_id, item.quantity)
        });
        /*
        try {
            const response = await fetch(`http://localhost:3000/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch cart products');
            }
            const data = await response.json();
            console.log(data.message);
            // console.log(data.prodInfo);
        } catch (error) {
            alert(error.message || 'Error fetching cart products');
            console.error('Error:', error);
        }
            */
        
    } catch (error) {
        alert(error.message || 'Error debiting amount');
        console.error('Error:', error);
    }
}
document.querySelector(".logo").addEventListener('click', ()=> {
    window.location.href = "site.html";
})