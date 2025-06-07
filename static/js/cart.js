// public/js/cart.js (or static/js/cart.js)

// Load cart items from localStorage and render
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartTableBody = document.querySelector("#cartTableBody");
  const cartTotal = document.querySelector("#cartTotal");
  const sendQuoteBtn = document.querySelector("#sendQuoteBtn");

  cartTableBody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    
    // Format the product details based on type
    let details = '';
    if (item.category === 'Blanket') {
      details = `<br><small>Machine: ${item.machine}</small>`;
      details += `<br><small>Thickness: ${item.thickness}</small>`;
    } else if (item.category === 'Underpacking') {
      details = `<br><small>Machine: ${item.machine}</small>`;
      details += `<br><small>Size: ${item.size}</small>`;
    }

    row.innerHTML = `
      <td>
        <strong>${item.category}</strong><br>
        ${item.name}${details}
      </td>
      <td>${item.quantity}</td>
      <td>₹${item.total_price.toLocaleString()}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Delete</button>
      </td>
    `;

    cartTableBody.appendChild(row);
    total += item.total_price;
  });

  cartTotal.textContent = `Subtotal: ₹${total.toLocaleString()}`;
  
  // Show total above send quote button
  const totalDisplay = document.querySelector("#totalDisplay");
  if (totalDisplay) {
    totalDisplay.textContent = `Subtotal: ₹${total.toLocaleString()}`;
  }

  // Enable/disable send quote button based on cart items
  if (sendQuoteBtn) {
    sendQuoteBtn.disabled = cart.length === 0;
  }
}

// Add item to cart using backend API
function addToCart(product) {
  // Get current cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Check if cart is full (max 50 items)
  if (cart.length >= 50) {
    showCartMessage("Cart is full. Maximum 50 items allowed.", false);
    return;
  }

  // Check if item already exists in cart
  const existingItem = cart.find(item => 
    item.category === product.category && 
    item.name === product.name && 
    item.machine === product.machine &&
    item.size === product.size &&
    item.thickness === product.thickness
  );

  if (existingItem) {
    // Update quantity and total price
    existingItem.quantity += product.quantity;
    existingItem.total_price = (existingItem.unit_price * existingItem.quantity).toFixed(2);
  } else {
    // Add new item
    product.id = product.id || 'item_' + Date.now();
    cart.push(product);
  }

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Update UI
  loadCart();
  showCartMessage(`Added ${product.quantity} ${product.category.toLowerCase()} to cart`, true);
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  showCartMessage("Item removed from cart", true);
}

// Send quote functionality
function sendQuote() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showCartMessage("Cart is empty. Please add items to cart first.", false);
    return;
  }

  // Create quote data
  const quoteData = {
    items: cart,
    subtotal: cart.reduce((sum, item) => sum + item.total_price, 0),
    timestamp: new Date().toISOString()
  };

  // Send to server (implement your backend endpoint)
  fetch('/send-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showCartMessage('Quote sent successfully!', true);
      // Clear cart after successful quote
      localStorage.removeItem('cart');
      loadCart();
    } else {
      showCartMessage('Failed to send quote. Please try again.', false);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showCartMessage('Failed to send quote. Please try again.', false);
  });
}

// Show success message helper
function showCartMessage(message, isSuccess = true) {
  const msgDiv = document.getElementById("cart-message");
  if (!msgDiv) return;

  msgDiv.innerHTML = `<div class="alert ${isSuccess ? "alert-success" : "alert-danger"}">${message}</div>`;
  msgDiv.style.display = "block";
  setTimeout(() => {
    msgDiv.style.display = "none";
  }, 2500);
}

// Run when cart.html loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes("/cart")) {
    loadCart();
    
    // Initialize send quote button
    const sendQuoteBtn = document.querySelector("#sendQuoteBtn");
    if (sendQuoteBtn) {
      sendQuoteBtn.addEventListener('click', sendQuote);
    }
  }
});
