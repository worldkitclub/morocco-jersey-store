function getCart() {
  try {
    return JSON.parse(localStorage.getItem('moroccoCart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('moroccoCart', JSON.stringify(cart));
}

function addToCart(productId, size = 'M', quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.productId === productId && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, size, quantity });
  }
  saveCart(cart);
  updateCartCount();
  showToast('Added to cart!');
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(item => !(item.productId === productId && item.size === size));
  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function updateQuantity(productId, size, delta) {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId && item.size === size);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    saveCart(cart);
    renderCartPage();
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = getCartCount();
  });
}

function getProduct(id) {
  return products.find(p => p.id === id);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const product = getProduct(item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderCartPage() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  const cart = getCart();
  const empty = document.getElementById('cart-empty');
  const full = document.getElementById('cart-full');

  if (cart.length === 0) {
    if (empty) empty.style.display = 'block';
    if (full) full.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (full) full.style.display = 'block';

  const itemsContainer = document.getElementById('cart-items');
  if (!itemsContainer) return;

  itemsContainer.innerHTML = cart.map(item => {
    const product = getProduct(item.productId);
    if (!product) return '';
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}" class="cart-item-image" onerror="this.src='https://placehold.co/100x100/e0e0e0/666?text=Jersey'">
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div style="font-size:0.85rem;color:var(--gray);margin-bottom:0.2rem">Size: ${item.size}</div>
          <div class="cart-item-price">$${product.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="updateQuantity(${item.productId},'${item.size}',-1)">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.productId},'${item.size}',1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.productId},'${item.size}')">✕</button>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = getCartTotal();
  document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;

  localStorage.setItem('moroccoCheckoutTotal', subtotal.toFixed(2));
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', updateCartCount);
