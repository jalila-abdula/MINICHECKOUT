const products = [
  { id: 1, name: "Hairclips", price: 50, category: "Accessories", image: "image/hairclips.jpg" },
  { id: 2, name: "Fountain Ballpen", price: 130, category: "School Supplies", image: "image/ballpen.png" },
  { id: 3, name: "Pink Backpack", price: 850, category: "Bags", image: "image/bag.jpg" },
  { id: 4, name: "Sci-Calculator", price: 800, category: "Electronics", image: "image/sci-cal.jpg" },
  { id: 5, name: "AquaFlusk Tumbler", price: 650, category: "Accessories", image: "image/tumbler.jpg" },
  { id: 6, name: "Pink Dress", price: 1280, category: "Clothes", image: "image/dress.jpg" }
];

let cart = [];
const productList = document.getElementById("productList");

products.forEach(p => {
  productList.innerHTML += `
    <div class="col-md-4 mb-3">
      <div class="card card-product">
        <img src="${p.image}" class="card-img-top product-img" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h6>${p.name}</h6>
          <small class="text-muted">${p.category}</small>
          <p class="mt-2">₱${p.price}</p>
          <button class="btn btn-sm btn-primary mt-auto" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>`;
});

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const item = cart.find(i => i.id === id);

  if (item) item.qty++;
  else cart.push({ ...product, qty: 1 });

  renderCart();
}

function updateQty(id, change) {
  const item = cart.find(i => i.id === id);
  item.qty += change;
  if (item.qty <= 0) removeItem(id);
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function computeTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = subtotal >= 1000 ? subtotal * 0.10 : 0;
  const deliveryMethod = document.getElementById("delivery").value;
  let shipping = 0;
  if (deliveryMethod === "Delivery") {
    shipping = subtotal >= 500 ? 0 : 80;
  }
  const tax = (subtotal - discount) * 0.12;
  const total = subtotal - discount + tax + shipping;
  return { subtotal, discount, shipping, tax, total };
}

function renderCart() {
  const tbody = document.getElementById("cartTableBody");
  tbody.innerHTML = "";

  cart.forEach(i => {
    tbody.innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>
          <button class="qty-btn" onclick="updateQty(${i.id},-1)">−</button>
          ${i.qty}
          <button class="qty-btn" onclick="updateQty(${i.id},1)">+</button>
        </td>
        <td>₱${(i.price * i.qty).toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeItem(${i.id})">✕</button>
        </td>
      </tr>`;
  });

  const t = computeTotals();
  document.getElementById("summary").innerHTML = `
    <p>Subtotal: ₱${t.subtotal.toFixed(2)}</p>
    <p>Discount: −₱${t.discount.toFixed(2)}</p>
    <p>Shipping: ₱${t.shipping.toFixed(2)}</p>
    <p>Tax (12%): ₱${t.tax.toFixed(2)}</p>
    <hr>
    <h5>Total: ₱${t.total.toFixed(2)}</h5>`;
}

const delivery = document.getElementById("delivery");
delivery.addEventListener("change", () => {
  const addressGroup = document.getElementById("addressGroup");
  addressGroup.classList.toggle("d-none", delivery.value !== "Delivery");
  renderCart(); 
});

document.getElementById("checkoutForm").addEventListener("submit", e => {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  showReceipt();
});

function showReceipt() {
  const t = computeTotals();
  const id = `ORD-2026-${Math.floor(Math.random() * 100000)}`;
  const now = new Date().toLocaleString();

  const form = document.getElementById("checkoutForm");
  const fullName = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const payment = form.querySelector('select').value;
  const deliveryMethod = document.getElementById("delivery").value;
  const address = form.querySelector('textarea') ? form.querySelector('textarea').value : "";

  document.getElementById("receiptContent").innerHTML = `
    <h4 class="mb-3">Order Receipt</h4>
    <p><strong>Order ID:</strong> ${id}<br><strong>Date:</strong> ${now}</p>

    <div class="row">
      <div class="col-md-6">
        <h5>Customer Information</h5>
        <p>
          <strong>Name:</strong> ${fullName}<br>
          <strong>Email:</strong> ${email}<br>
          <strong>Payment Method:</strong> ${payment}<br>
          <strong>Delivery Method:</strong> ${deliveryMethod}${deliveryMethod === 'Delivery' ? `<br><strong>Address:</strong> ${address}` : ''}
        </p>
      </div>
      <div class="col-md-6">
        <h5>Order Items</h5>
        ${cart.map(i => `<p>${i.name} × ${i.qty} — ₱${(i.price * i.qty).toFixed(2)}</p>`).join("")}
        <hr>
        <p>Subtotal: ₱${t.subtotal.toFixed(2)}</p>
        <p>Discount: −₱${t.discount.toFixed(2)}</p>
        <p>Shipping: ₱${t.shipping.toFixed(2)}</p>
        <p>Tax: ₱${t.tax.toFixed(2)}</p>
        <h5>Total: ₱${t.total.toFixed(2)}</h5>
      </div>
    </div>
  `;

  new bootstrap.Modal(document.getElementById("receiptModal")).show();
}