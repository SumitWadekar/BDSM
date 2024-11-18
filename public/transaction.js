let cartItems =[];
function generateOrderId() {
    return 'BH' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get cart items from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cartitem')) || [];
}

// Initialize page
window.onload = async function () {
    // Set order ID and date

    document.getElementById('orderId').textContent = generateOrderId();
    document.getElementById('orderDate').textContent = formatDate(new Date());
    //

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
        console.log(data);
        cartItems = data.prodInfo; // Save cart data globally
    } catch (error) {
        alert(error.message || 'Book not found');
        console.error('Error:', error);
    }
    // Get cart items
    const itemsList = document.getElementById('itemsList');
    let total = 0;

    // Populate items
    cartItems.forEach(item => {
        // Remove the dollar sign and other non-numeric characters
        console.log(item);
        const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const itemTotal = price * quantity;
        total += itemTotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <div>${item.product_name} × ${quantity}</div>
            <div>₹${itemTotal.toFixed(2)}</div>
        `;
        itemsList.appendChild(itemDiv);
    });

    // Set total amount
    document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;

    // Clear cart
    localStorage.removeItem('cart');
};

document.getElementById("homie").addEventListener("click", async () => {
    //remove 
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
    }
});
