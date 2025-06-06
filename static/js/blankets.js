let machineData = [], blanketData = [], barData = [], discountData = [], thicknessData = [];
let basePrice = 0, priceWithBar = 0, finalDiscountedPrice = 0;

window.onload = () => {
  fetch("/blankets-data/machine.json")
    .then(res => res.json())
    .then(data => {
      machineData = data.machines;
      const select = document.getElementById("machineSelect");
      select.innerHTML = '<option value="">--Select Machine--</option>';
      machineData.forEach(machine => {
        const option = document.createElement("option");
        option.value = machine.id;
        option.text = machine.name;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        document.getElementById("blanketSection").style.display = 'block';
      });
    });

  fetch("/blankets-data/blankets.json")
    .then(res => res.json())
    .then(data => {
      blanketData = data.products;
      const blanketSelect = document.getElementById("blanketSelect");
      blanketSelect.innerHTML = '<option value="">--Select Blanket--</option>';
      blanketData.forEach(blanket => {
        const opt = document.createElement("option");
        opt.value = blanket.id;
        opt.text = blanket.name;
        blanketSelect.appendChild(opt);
      });

      blanketSelect.addEventListener("change", () => {
        displayRates();
        calculatePrice();
      });
    });

  fetch("/blankets-data/bar.json")
    .then(res => res.json())
    .then(data => {
      barData = data.bars;
      const barSelect = document.getElementById("barSelect");
      barSelect.innerHTML = '<option value="">--Select--</option>';
      barData.forEach(bar => {
        const opt = document.createElement("option");
        opt.value = bar.barRate;
        opt.text = bar.bar;
        barSelect.appendChild(opt);
      });

      // ✅ FIXED: Update discounted/final prices on bar change
      barSelect.onchange = () => {
        const barRate = parseFloat(barSelect.value || 0);
        priceWithBar = basePrice + barRate;

        document.getElementById("barRate").innerText = `Barring Price/pc: ₹${barRate.toFixed(2)}`;
        document.getElementById("netUnitPrice").innerText = `Net Price/Unit: ₹${priceWithBar.toFixed(2)}`;

        document.getElementById("applyDiscountBtn").style.display = 'block';

        const qty = parseInt(document.getElementById("quantityInput").value);
        if (qty > 0) updatePrices();
      };
    });

  fetch("/blankets-data/discount.json")
    .then(res => res.json())
    .then(data => discountData = data.discounts);

  fetch("/blankets-data/thickness.json")
    .then(res => res.json())
    .then(data => {
      thicknessData = data.thicknesses;
      const select = document.getElementById("thicknessSelect");
      select.innerHTML = '<option value="">--Select Thickness--</option>';
      thicknessData.forEach(th => {
        const opt = document.createElement("option");
        opt.value = th.value;
        opt.text = th.label;
        select.appendChild(opt);
      });
    });

  document.getElementById("lengthInput").addEventListener("input", calculatePrice);
  document.getElementById("widthInput").addEventListener("input", calculatePrice);
  document.getElementById("unitSelect").addEventListener("change", calculatePrice);
  document.getElementById("thicknessSelect").addEventListener("change", calculatePrice);
  document.getElementById("quantityInput").addEventListener("input", updatePrices);
  document.getElementById("discountSelect").addEventListener("change", updatePrices);
  document.getElementById("gstSelect").addEventListener("change", applyGST);

  document.getElementById("applyDiscountBtn").addEventListener("click", () => {
    showDiscountSection();
    updatePrices();
  });

  document.getElementById("applyDiscountBtn").style.display = 'none';
};

function convertToMeters(value, unit) {
  if (!value) return 0;
  switch(unit) {
    case "mm": return value / 1000;
    case "m": return value;
    case "in": return value * 0.0254;
    default: return value;
  }
}

function displayRates() {
  const selected = blanketData.find(p => p.id == document.getElementById("blanketSelect").value);
  if (selected) {
    document.getElementById("rateSqMeter").innerText = `₹${selected.ratePerSqMt}`;
    document.getElementById("rateSqYard").innerText = `₹${selected.ratePerSqYard}`;
  } else {
    document.getElementById("rateSqMeter").innerText = '-';
    document.getElementById("rateSqYard").innerText = '-';
  }
}

function calculatePrice() {
  const lengthInput = parseFloat(document.getElementById("lengthInput").value);
  const widthInput = parseFloat(document.getElementById("widthInput").value);
  const unit = document.getElementById("unitSelect").value;
  const thickness = parseFloat(document.getElementById("thicknessSelect").value);
  const product = blanketData.find(p => p.id == document.getElementById("blanketSelect").value);

  if (!lengthInput || !widthInput || !thickness || !product) {
    document.getElementById("calculatedArea").innerText = '';
    document.getElementById("basePrice").innerText = '';
    return;
  }

  const length = convertToMeters(lengthInput, unit);
  const width = convertToMeters(widthInput, unit);
  const areaSqM = length * width;
  const areaSqYd = areaSqM * 1.19599;

  basePrice = areaSqM * product.ratePerSqMt;

  document.getElementById("calculatedArea").innerText = `Area: ${areaSqM.toFixed(3)} sq.m / ${areaSqYd.toFixed(3)} sq.yd`;
  document.getElementById("basePrice").innerText = `Base Price: ₹${basePrice.toFixed(2)}`;

  const barRate = parseFloat(document.getElementById("barSelect").value || 0);
  priceWithBar = basePrice + barRate;

  document.getElementById("barRate").innerText = barRate
    ? `Barring Price/pc: ₹${barRate.toFixed(2)}`
    : '';
  document.getElementById("netUnitPrice").innerText = barRate
    ? `Net Price/Unit: ₹${priceWithBar.toFixed(2)}`
    : '';

  updatePrices();
}

function updatePrices() {
  const qty = parseInt(document.getElementById("quantityInput").value) || 0;
  const discountVal = document.getElementById("discountSelect").value;

  if (!priceWithBar || qty <= 0) {
    document.getElementById("totalNetPrice").innerText = "";
    document.getElementById("discountedPrice").innerText = "";
    document.getElementById("finalPrice").innerText = "";
    finalDiscountedPrice = 0;
    return;
  }

  let totalPrice = priceWithBar * qty;

  if (discountVal) {
    const discount = parseFloat(discountVal.replace('%', '')) || 0;
    finalDiscountedPrice = totalPrice * (1 - discount / 100);
    document.getElementById("discountedPrice").innerText = `Discounted Price (excl. GST): ₹${finalDiscountedPrice.toFixed(2)}`;
  } else {
    finalDiscountedPrice = totalPrice;
    document.getElementById("discountedPrice").innerText = "";
  }

  document.getElementById("totalNetPrice").innerText = `Total Net Price (excl. GST): ₹${totalPrice.toFixed(2)}`;
  applyGST();
}

function applyGST() {
  const gstRate = parseInt(document.getElementById("gstSelect").value);
  if (!finalDiscountedPrice || isNaN(gstRate)) {
    document.getElementById("finalPrice").innerText = "";
    return;
  }

  const gstAmount = finalDiscountedPrice * (gstRate / 100);
  const totalWithGST = finalDiscountedPrice + gstAmount;

  document.getElementById("finalPrice").innerText = `Final Price (incl. GST @ ${gstRate}%): ₹${totalWithGST.toFixed(2)}`;
}

function showDiscountSection() {
  const discountSelect = document.getElementById("discountSelect");
  discountSelect.innerHTML = '<option value="">--Select Discount--</option>';
  discountData.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.text = d;
    discountSelect.appendChild(opt);
  });
  document.getElementById("discountSection").style.display = 'block';
  document.getElementById("applyDiscountBtn").style.display = 'none';
}
