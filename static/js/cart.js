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
    } else {
      msgDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
    }
  })
  .catch(err => {
    document.getElementById("cart-message").innerHTML =
      `<div class="alert alert-danger">Something went wrong.</div>`;
  });
}
function removeFromCart(productId) {
  fetch('/remove_from_cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `product_id=${encodeURIComponent(productId)}`
  })
  .then(() => {
    window.location.reload();
  });
}
