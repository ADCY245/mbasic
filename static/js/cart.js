// public/js/cart.js (or static/js/cart.js)

// Load cart items from localStorage and render
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartTableBody = document.querySelector("#cartTableBody");
  const cartTotal = document.querySelector("#cartTotal");

  cartTableBody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <strong>${item.category}</strong><br>
        ${item.name}
        ${item.machine ? `<br><small>Machine: ${item.machine}</small>` : ''}
      </td>
      <td>${item.quantity}</td>
      <td>₹${item.total_price.toLocaleString()}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id || index})">Delete</button>
      </td>
    `;

    cartTableBody.appendChild(row);
    total += item.total_price;
  });

  cartTotal.textContent = `Total: ₹${total.toLocaleString()}`;
  
  // Show total above send invoice button
  const totalDisplay = document.querySelector("#totalDisplay");
  if (totalDisplay) {
    totalDisplay.textContent = `Total: ₹${total.toLocaleString()}`;
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
    item.machine === product.machine
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
  }
});
