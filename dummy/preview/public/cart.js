async function fetchCartProducts() {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    if (!accessToken) {
        alert("Access token not found. Please log in again.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cart_customer', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch cart products');
        }

        const data = await response.json();
        
        console.log(data.message);  // This will log "Cart products retrieved successfully"
        console.log(data.prodInfo); // Logs the array of products in the cart
        
        // Handle displaying the cart products in your HTML

    } catch (error) {
        alert(error.message || 'Error fetching cart products');
        console.error('Error:', error);
    }
}

document.getElementById("Checkout").addEventListener("click",fetchCartProducts);