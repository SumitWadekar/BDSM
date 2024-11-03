const quantityInputs = document.querySelectorAll('.quantity');
quantityInputs.forEach(input => {
    input.addEventListener('click', () => {
        UpdateItems();
        UpdatePrice();
    });
});
document.addEventListener('DOMContentLoaded', function() {
    UpdatePrice(); // Call the UpdatePrice function when the page loads
});
document.querySelector('#Checkout').addEventListener('click',()=>{
    // const parent = document.querySelector('#cart');
    const cart_items = document.querySelectorAll('.cart-items');
    cart_items.forEach(element => {
        const parent = element.parentNode;
        parent.removeChild(element);
        UpdateItems();
        UpdatePrice();
    })
})
const remove_buttons = document.querySelectorAll('.cart-item-remove');
remove_buttons.forEach(element => {
    element.addEventListener('click', () => {
        Remove_div(event);
        UpdateItems();
        UpdatePrice();
    })
})

function UpdateItems(event){
    let total_items = 0;
    const divs = document.querySelectorAll(".quantity");
    for(let element of divs){
        total_items+=parseInt(element.value);
        
    }
    document.getElementById('Total-items').innerText = `${total_items} item/s`;
}

function UpdatePrice(event) {
    let price = 0;
    const divs = document.querySelectorAll(".quantity");
    const priceDivs = document.querySelectorAll(".cart-item-price");
    
    divs.forEach((element, index) => {
        // Correctly parse the price by slicing off the dollar sign
        const itemPrice = parseFloat(priceDivs[index].innerText.slice(1));
        price += parseInt(element.value) * itemPrice;
    });
    
    // Update the total amount in the element with ID 'Total-amount'
    document.getElementById('Total-amount').innerText = `₹${price.toFixed(2)}`; // Format the price to two decimal places
}

function Remove_div(event){
    let parent = (event.target.parentNode).parentNode
    parent.remove();
}