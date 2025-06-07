// public/js/cart.js (or static/js/cart.js)

// Initialize cart functionality
function initializeCart() {
  // Initialize Bootstrap components
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  // Initialize toast container
  let toastContainer = document.getElementById('cartToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'cartToastContainer';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  // Load cart if we're on cart page
  if (window.location.pathname.includes("/cart")) {
    loadCart();
    
    // Initialize send quote button
    const sendQuoteBtn = document.getElementById('sendQuoteBtn');
    if (sendQuoteBtn) {
      sendQuoteBtn.addEventListener('click', sendQuote);
    }
  }
}

// Load cart items from backend
function loadCart() {
  fetch('/get_cart')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        displayCart(data.cart);
      }
    })
    .catch(error => {
      console.error('Error loading cart:', error);
      displayCart([]);
    });
}

// Display cart items in the table
function displayCart(cart) {
  const cartTableBody = document.getElementById('cartTableBody');
  const cartTotal = document.getElementById('cartTotal');
  const sendQuoteBtn = document.getElementById('sendQuoteBtn');
  
  if (!cartTableBody || !cartTotal) return;

  cartTableBody.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <strong>${item.category}</strong><br>
        ${item.name}
      </td>
      <td>${item.quantity}</td>
      <td>₹${item.final_price.toFixed(2)}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Delete</button>
      </td>
    `;

    cartTableBody.appendChild(row);
    total += item.final_price;
  });

  cartTotal.textContent = `₹${total.toFixed(2)}`;
  
  // Show total above send quote button
  const totalDisplay = document.querySelector("#totalDisplay");
  if (totalDisplay) {
    totalDisplay.textContent = `Subtotal: ₹${total.toFixed(2)}`;
  }

  // Enable/disable send quote button based on cart items
  if (sendQuoteBtn) {
    sendQuoteBtn.disabled = cart.length === 0;
  }
}

// Remove item from cart
function removeFromCart(productId) {
  fetch('/remove_from_cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Item removed from cart', true);
      loadCart();
    } else {
      showToast('Failed to remove item', false);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Failed to remove item', false);
  });
}

// Send quote functionality
function sendQuote() {
  fetch('/send-quote', {
    method: 'POST'
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Quote sent successfully!', true);
      // Reload cart after sending quote
      loadCart();
    } else {
      showToast('Failed to send quote. Please try again.', false);
    }
  })
  .catch(error => {
    console.error('Error sending quote:', error);
    showToast('Failed to send quote. Please try again.', false);
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

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  // Initialize cart if we're on cart page
  if (window.location.pathname.includes("/cart")) {
    loadCart();
    
    // Initialize send quote button
    const sendQuoteBtn = document.querySelector("#sendQuoteBtn");
    if (sendQuoteBtn) {
      sendQuoteBtn.addEventListener('click', sendQuote);
    }
  }

  // Initialize toast container for notifications
  let toastContainer = document.getElementById('cartToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'cartToastContainer';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
});
