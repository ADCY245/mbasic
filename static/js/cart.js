// public/js/cart.js (or static/js/cart.js)

// Load cart items from localStorage and render (if still needed)
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
}

// Add item to cart using backend API
function addToCart(product) {
  fetch('/add_to_cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(data => {
    const msgDiv = document.getElementById("cart-message");
    if (data.success) {
      msgDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      // Optionally reload or refresh cart after adding
      loadCart();
    } else {
      msgDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
    }
  })
  .catch(err => {
    document.getElementById("cart-message").innerHTML =
      `<div class="alert alert-danger">Something went wrong.</div>`;
  });
}

// Remove item from cart using backend API
function removeFromCart(productId) {
  fetch('/remove_from_cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `product_id=${encodeURIComponent(productId)}`
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      loadCart();
      const msgDiv = document.getElementById("cart-message");
      msgDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    } else {
      const msgDiv = document.getElementById("cart-message");
      msgDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
    }
  })
  .catch(() => {
    document.getElementById("cart-message").innerHTML =
      `<div class="alert alert-danger">Something went wrong.</div>`;
  });
}

// Show success message helper (optional if you want separate usage)
function showCartMessage(message, isSuccess = true) {
  const msgDiv = document.getElementById("cart-message");
  msgDiv.innerHTML = `<div class="alert ${isSuccess ? "alert-success" : "alert-danger"}">${message}</div>`;
  msgDiv.style.display = "block";
  setTimeout(() => {
    msgDiv.style.display = "none";
  }, 2500);
}

// Run when cart.html loads
if (window.location.pathname.includes("/cart")) {
  loadCart();
}
