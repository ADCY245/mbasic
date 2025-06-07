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
  // First add to localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Check if cart is full (max 20 items to match backend limit)
  if (cart.length >= 20) {
    showCartMessage("Cart is full. Maximum 20 items allowed.", false);
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

  // Also send to backend
  fetch('/add_to_cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      showCartMessage(data.message || 'Failed to add to cart', false);
      // If backend failed, remove from localStorage
      removeFromCart(product.id);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showCartMessage('Failed to add to cart. Please try again.', false);
    // If backend failed, remove from localStorage
    removeFromCart(product.id);
  });
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
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('cartToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'cartToastContainer';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${isSuccess ? 'bg-success text-white' : 'bg-danger text-white'}`;
  toast.innerHTML = `
    <div class="toast-header ${isSuccess ? 'bg-success text-white' : 'bg-danger text-white'}">
      <strong class="me-auto">${isSuccess ? 'Success' : 'Error'}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', () => {
    toastContainer.removeChild(toast);
  });
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
