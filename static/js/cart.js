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
