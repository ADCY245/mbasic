let priceMap = {};
let currentNetPrice = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadMachines();

  document.getElementById("machineSelect").addEventListener("change", () => {
    document.getElementById("thicknessSection").style.display = "block";
  });

  document.getElementById("thicknessSelect").addEventListener("change", loadSizes);
  document.getElementById("sizeSelect").addEventListener("change", handleSizeSelection);
  document.getElementById("sheetInput").addEventListener("input", calculateFinalPrice);
  document.getElementById("discountSelect").addEventListener("change", applyDiscount);
});

function loadMachines() {
  fetch("/blankets-data/machine.json")
    .then(res => res.json())
    .then(data => {
      const machineSelect = document.getElementById("machineSelect");
      data.machines.forEach(machine => {
        const opt = document.createElement("option");
        opt.value = machine.id;
        opt.textContent = machine.name;
        machineSelect.appendChild(opt);
      });
    });
}

function loadSizes() {
  const thickness = document.getElementById("thicknessSelect").value;
  if (!thickness) return;

  Promise.all([
    fetch(`/static/products/chemical/${thickness}.json`).then(res => {
      if (!res.ok) throw new Error("Thickness data not found");
      return res.json();
    }),
    fetch(`/static/products/chemical/price.json`).then(res => {
      if (!res.ok) throw new Error("Price data not found");
      return res.json();
    })
  ])
  .then(([sizesData, priceData]) => {
    const sizeSelect = document.getElementById("sizeSelect");
    sizeSelect.innerHTML = '<option value="">-- Select Size --</option>';

    const priceLookup = {};
    priceData.forEach(p => {
      priceLookup[p.id] = p.price;
    });

    priceMap = {};

    sizesData.forEach(item => {
      const price = priceLookup[item.id] ?? 0;
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = `${item.width} x ${item.length}`;
      sizeSelect.appendChild(opt);

      priceMap[item.id] = price;
    });

    document.getElementById("sizeSection").style.display = "block";
    calculateFinalPrice();
  })
  .catch(err => {
    console.error("Failed to load thickness or price JSON:", err);
    alert("Could not load data for selected thickness.");
  });
}

function handleSizeSelection() {
  const id = document.getElementById("sizeSelect").value;
  if (!id) {
    resetCalculations();
    return;
  }

  const price = priceMap[id];
  currentNetPrice = price;
  document.getElementById("netPrice").textContent = price.toFixed(2);
  document.getElementById("priceSection").style.display = "block";
  document.getElementById("sheetInputSection").style.display = "block";
  calculateFinalPrice();
}

function resetCalculations() {
  currentNetPrice = 0;
  document.getElementById("netPrice").textContent = "0.00";
  document.getElementById("totalPrice").textContent = "0.00";
  document.getElementById("gstAmount").textContent = "0.00";
  document.getElementById("finalPrice").textContent = "0.00";
  document.getElementById("finalDiscountedPrice").textContent = "0.00";
  document.getElementById("discountSelect").value = "0";

  document.getElementById("priceSection").style.display = "none";
  document.getElementById("sheetInputSection").style.display = "none";
  document.getElementById("totalPriceSection").style.display = "none";
  document.getElementById("discountPromptSection").style.display = "none";
  document.getElementById("discountSection").style.display = "none";
  document.getElementById("addToCartBtn").style.display = "none";
}

function calculateFinalPrice() {
  const quantity = parseInt(document.getElementById("sheetInput").value);
  if (!quantity || quantity <= 0) return;

  const total = currentNetPrice * quantity;
  const gst = total * 0.12;
  const final = total + gst;

  document.getElementById("totalPrice").textContent = total.toFixed(2);
  document.getElementById("gstAmount").textContent = gst.toFixed(2);
  document.getElementById("finalPrice").textContent = final.toFixed(2);
  document.getElementById("finalDiscountedPrice").textContent = final.toFixed(2);

  document.getElementById("totalPriceSection").style.display = "block";
  document.getElementById("discountPromptSection").style.display = "block";
  document.getElementById("addToCartBtn").style.display = "block";

  // Update discount if selected
  const discountSelect = document.getElementById("discountSelect");
  if (discountSelect.value) {
    applyDiscount();
  }
}

function showDiscountSection(apply) {
  const discountSection = document.getElementById("discountSection");
  const finalPrice = document.getElementById("finalPrice").textContent;
  const finalDiscountedPrice = document.getElementById("finalDiscountedPrice");

  if (!apply) {
    discountSection.style.display = "none";
    finalDiscountedPrice.textContent = finalPrice;
    return;
  }

  // Load discount options
  fetch("/blankets-data/discount.json")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("discountSelect");
      select.innerHTML = '<option value="">-- Select Discount --</option>';
      data.discounts.forEach(discountStr => {
        const percent = parseFloat(discountStr);
        const opt = document.createElement("option");
        opt.value = percent;
        opt.textContent = discountStr;
        select.appendChild(opt);
      });
      discountSection.style.display = "block";
      finalDiscountedPrice.textContent = finalPrice;
    });
}

function applyDiscount() {
  const discountPercent = parseFloat(document.getElementById("discountSelect").value);
  const finalBeforeDiscount = parseFloat(document.getElementById("finalPrice").textContent);
  const discountedAmount = finalBeforeDiscount * (discountPercent / 100);
  const finalDiscounted = finalBeforeDiscount - discountedAmount;

  document.getElementById("finalDiscountedPrice").textContent = finalDiscounted.toFixed(2);
}

function addMpackToCart() {
  const machineSelect = document.getElementById('machineSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const quantityInput = document.getElementById('sheetInput');
  const finalPrice = document.getElementById('finalDiscountedPrice');

  if (!machineSelect.value || !sizeSelect.value || !quantityInput.value) {
    alert('Please select machine, size, and quantity first!');
    return;
  }

  const product = {
    id: 'mpack_' + new Date().getTime(),
    category: 'Underpacking',
    name: 'Underpacking',
    machine: machineSelect.options[machineSelect.selectedIndex].text,
    size: sizeSelect.options[sizeSelect.selectedIndex].text,
    quantity: parseInt(quantityInput.value),
    unit_price: parseFloat(finalPrice.textContent) / parseInt(quantityInput.value),
    total_price: parseFloat(finalPrice.textContent),
    redirect_route: 'mpack'
  };

  // Add to cart using local storage
  addToCart(product);
  
  // Also send to server if needed
  fetch('/add_to_cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Underpacking added to cart!');
      resetCalculations();
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to add to cart. Please try again.');
  });
}
