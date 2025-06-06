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
    fetch(`/static/chemicals/${thickness}.json`).then(res => {
      if (!res.ok) throw new Error("Thickness data not found");
      return res.json();
    }),
    `/static/chemicals/${price}.json`
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
  })
  .catch(err => {
    console.error("Failed to load thickness or price JSON:", err);
    alert("Could not load data for selected thickness.");
  });
}

function handleSizeSelection() {
  const id = document.getElementById("sizeSelect").value;
  if (!id) return;

  const price = priceMap[id];
  currentNetPrice = price;
  document.getElementById("netPrice").textContent = price.toFixed(2);
  document.getElementById("priceSection").style.display = "block";
  document.getElementById("sheetInputSection").style.display = "block";
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

  document.getElementById("totalPriceSection").style.display = "block";
  document.getElementById("discountPromptSection").style.display = "block";
  document.getElementById("addToCartBtn").style.display = "block";
}

function showDiscountSection(apply) {
  if (!apply) {
    document.getElementById("discountSection").style.display = "none";
    document.getElementById("finalDiscountedPrice").textContent = document.getElementById("finalPrice").textContent;
    return;
  }

 
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

      document.getElementById("discountSection").style.display = "block";
    });
}

function applyDiscount() {
  const discountPercent = parseFloat(document.getElementById("discountSelect").value);
  const finalBeforeDiscount = parseFloat(document.getElementById("finalPrice").textContent);
  const discountedAmount = finalBeforeDiscount * (discountPercent / 100);
  const finalDiscounted = finalBeforeDiscount - discountedAmount;

  document.getElementById("finalDiscountedPrice").textContent = finalDiscounted.toFixed(2);
}

