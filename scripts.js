const fallbackProducts = [
  {
    id: 1,
    name: 'The Dynasty Tee',
    category: 'T-Shirt',
    agent: 'KingAgent',
    gsm: 320,
    price: 180,
    label: 'Acid Wash Tee',
    description: 'A heavyweight 320 GSM acid wash tee with premium streetwear fit and bold branding.',
    mockupImage: 'images/dynasty-tee-mockup.svg',
    realImage: 'images/dynasty-tee-real.svg',
    colors: ['#111111', '#d6d6d6', '#6e4b2f'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 2,
    name: 'Gold Coast Hoodie',
    category: 'Hoodie',
    agent: 'QueenBee',
    gsm: 260,
    price: 250,
    label: 'Streetwear Hoodie',
    description: 'Soft 260 GSM brushed fleece with a clean gold-accented design for premium comfort.',
    mockupImage: 'images/gold-coast-hoodie-mockup.svg',
    realImage: 'images/gold-coast-hoodie-real.svg',
    colors: ['#222222', '#c6a34d', '#444444'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 3,
    name: 'Black Snapback',
    category: 'Caps',
    agent: 'CrownCrew',
    gsm: 0,
    price: 115,
    label: 'Signature Snapback',
    description: 'One-size-fits-all snapback with bold embroidery and adjustable comfort fit.',
    mockupImage: 'images/black-snapback-mockup.svg',
    realImage: 'images/black-snapback-real.svg',
    colors: ['#111111', '#333333'],
    sizes: ['OSFA'],
  },
  {
    id: 4,
    name: '320 GSM Crop Top',
    category: 'Crop Top',
    agent: 'HustleWear',
    gsm: 320,
    price: 180,
    label: 'Ladies Structured Crop',
    description: 'Premium structured crop top built with heavyweight 320 GSM fabric for a sharp silhouette.',
    mockupImage: 'images/crop-top-mockup.svg',
    realImage: 'images/crop-top-real.svg',
    colors: ['#e8e2d3', '#191919'],
    sizes: ['S', 'M', 'L'],
  },
];

let products = [];
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const gsmFilter = document.getElementById('gsmFilter');
const sortSelect = document.getElementById('sortSelect');
const referralLink = document.getElementById('referralLink');
const copyReferralBtn = document.getElementById('copyReferralBtn');
const designUploadForm = document.getElementById('designUploadForm');
const uploadStatus = document.getElementById('uploadStatus');
const showRealBtn = document.getElementById('showRealBtn');
const showMockupBtn = document.getElementById('showMockupBtn');
const realPhoto = document.getElementById('realPhoto');
const mockupPhoto = document.getElementById('mockupPhoto');
const gsmSelect = document.getElementById('gsmSelect');
const productPrice = document.getElementById('productPrice');
const addToCartBtn = document.getElementById('addToCartBtn');
const productTitle = document.getElementById('productTitle');
const productCategory = document.getElementById('productCategory');
const productLabel = document.getElementById('productLabel');
const productDescription = document.getElementById('productDescription');
const productMockupImage = document.getElementById('productMockupImage');
const productRealImage = document.getElementById('productRealImage');
const colorSwatches = document.getElementById('colorSwatches');
const sizeSelect = document.getElementById('sizeSelect');
const productDetailSection = document.getElementById('productDetailSection');
const cartCountEl = document.getElementById('cartCount');

const cartKey = 'kingsCart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

function updateCartCount() {
  if (!cartCountEl) return;
  const count = getCartCount();
  cartCountEl.textContent = count;
  cartCountEl.style.opacity = count > 0 ? '1' : '0.7';
}

function showToast(message, variant = 'default') {
  let toastRoot = document.getElementById('toastRoot');
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'toastRoot';
    toastRoot.className = 'toast-root';
    document.body.appendChild(toastRoot);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

function addToCart(productId, quantity = 1) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) {
    showToast('Unable to add that product. Please try again.', 'error');
    return;
  }

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  saveCart(cart);
  updateCartCount();
  showToast(`${product.name} added to cart.`, 'success');
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== Number(productId));
  saveCart(cart);
  updateCartCount();
  renderCheckoutCart();
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products from backend');
    }
    products = await response.json();
  } catch (error) {
    console.warn('Backend fetch failed:', error.message);
    try {
      const fallbackResponse = await fetch('products.json');
      if (!fallbackResponse.ok) throw new Error('Fallback fetch failed');
      products = await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Fallback products failed:', fallbackError.message);
      products = fallbackProducts;
    }
  }

  renderProducts();
  loadProductDetail();
}

function renderProducts() {
  if (!productGrid) return;
  const searchValue = searchInput?.value.toLowerCase() || '';
  const selectedGsm = gsmFilter?.value;
  const sortValue = sortSelect?.value;

  let filtered = products.filter((product) => {
    const matchedSearch = [product.name, product.category, product.agent]
      .join(' ')
      .toLowerCase()
      .includes(searchValue);
    const matchedGsm = selectedGsm === 'all' || `${product.gsm}` === selectedGsm;
    return matchedSearch && matchedGsm;
  });

  if (sortValue === 'gsmAsc') {
    filtered.sort((a, b) => a.gsm - b.gsm);
  } else if (sortValue === 'gsmDesc') {
    filtered.sort((a, b) => b.gsm - a.gsm);
  } else if (sortValue === 'priceAsc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'priceDesc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  productGrid.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-thumb">
            <img src="${product.mockupImage}" alt="${product.name} mockup" />
          </div>
          <div>
            <p class="eyebrow">${product.category}</p>
            <h3>${product.name}</h3>
            <p class="price">GHC ${product.price.toFixed(2)}</p>
          </div>
          <div class="product-card-actions">
            <a href="product.html?id=${product.id}">View Product</a>
            <button class="btn btn-secondary product-add-btn" data-product-id="${product.id}">Add to Cart</button>
          </div>
        </article>
      `
    )
    .join('');
}

function loadProductDetail() {
  if (!productDetailSection) return;

  const productId = Number(new URLSearchParams(window.location.search).get('id'));
  const product = products.find((item) => item.id === productId) || products[0];

  if (!product) return;

  if (productTitle) productTitle.textContent = product.name;
  if (productCategory) productCategory.textContent = product.category;
  if (productLabel) productLabel.textContent = product.label;
  if (productDescription) productDescription.textContent = product.description;
  if (productPrice) productPrice.textContent = `GHC ${product.price.toFixed(2)}`;

  if (productMockupImage) {
    productMockupImage.src = product.mockupImage;
    productMockupImage.alt = `${product.name} mockup`;
  }
  if (productRealImage) {
    productRealImage.src = product.realImage;
    productRealImage.alt = `${product.name} real photo`;
  }

  // Populate GSM select based on product
  if (gsmSelect) {
    const gsmOptions = product.gsm > 0 
      ? [{ value: product.gsm, label: `${product.gsm} GSM (Standard)` }]
      : [{ value: 0, label: 'Standard' }];
    
    // Add other common GSM options if applicable
    if (product.category === 'T-Shirt' || product.category === 'Hoodie' || product.category === 'Crop Top') {
      const commonGsms = [230, 260, 320].filter(g => g !== product.gsm);
      commonGsms.forEach(g => {
        gsmOptions.push({ value: g, label: `${g} GSM` });
      });
    }
    
    gsmSelect.innerHTML = gsmOptions
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join('');
  }

  // Populate color swatches with selection functionality
  if (colorSwatches) {
    colorSwatches.innerHTML = product.colors
      .map((color, index) => `<button class="color-swatch${index === 0 ? ' selected' : ''}" style="background:${color}" data-color="${color}"></button>`)
      .join('');
    
    colorSwatches.addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch');
      if (swatch) {
        colorSwatches.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
      }
    });
  }

  if (sizeSelect) {
    sizeSelect.innerHTML = product.sizes.map((size) => `<option>${size}</option>`).join('');
  }

  if (addToCartBtn) {
    addToCartBtn.onclick = () => addToCart(product.id);
  }

  // Handle Buy Now button - add to cart and redirect
  const buyNowBtn = document.querySelector('.product-actions .btn-primary');
  if (buyNowBtn) {
    buyNowBtn.onclick = (e) => {
      e.preventDefault();
      addToCart(product.id);
      window.location.href = 'checkout.html';
    };
  }
}

function renderCheckoutCart() {
  const cartItemsEl = document.getElementById('cartItems');
  const totalPriceEl = document.getElementById('totalPrice');
  const depositPriceEl = document.getElementById('depositPrice');
  const balancePriceEl = document.getElementById('balancePrice');

  if (!cartItemsEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p>Your cart is empty. <a href="index.html">Continue shopping</a>.</p>';
    if (totalPriceEl) totalPriceEl.textContent = 'GHC 0.00';
    if (depositPriceEl) depositPriceEl.textContent = 'GHC 0.00';
    if (balancePriceEl) balancePriceEl.textContent = 'GHC 0.00';
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <p class="cart-item-title">${item.name}</p>
          <p class="cart-item-meta">Qty: ${item.quantity} x GHC ${item.price.toFixed(2)}</p>
        </div>
        <div>
          <button class="btn btn-secondary remove-cart-btn" data-product-id="${item.id}">Remove</button>
        </div>
      </div>
    `
    )
    .join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deposit = total * 0.5;
  const balance = total - deposit;

  if (totalPriceEl) totalPriceEl.textContent = `GHC ${total.toFixed(2)}`;
  if (depositPriceEl) depositPriceEl.textContent = `GHC ${deposit.toFixed(2)}`;
  if (balancePriceEl) balancePriceEl.textContent = `GHC ${balance.toFixed(2)}`;
}

function initializePage() {
  if (productGrid) {
    loadProducts();
    searchInput?.addEventListener('input', renderProducts);
    gsmFilter?.addEventListener('change', renderProducts);
    sortSelect?.addEventListener('change', renderProducts);
  } else {
    loadProducts();
  }

  updateCartCount();

  document.body.addEventListener('click', (event) => {
    const addButton = event.target.closest('.product-add-btn');
    if (addButton) {
      const id = addButton.dataset.productId;
      addToCart(id);
    }

    const removeButton = event.target.closest('.remove-cart-btn');
    if (removeButton) {
      const id = removeButton.dataset.productId;
      removeFromCart(id);
    }
  });

  if (copyReferralBtn && referralLink) {
    copyReferralBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(referralLink.value);
        copyReferralBtn.textContent = 'Copied!';
        setTimeout(() => (copyReferralBtn.textContent = 'Copy My Referral Link'), 1800);
      } catch (error) {
        copyReferralBtn.textContent = 'Copy Failed';
      }
    });
  }

  if (window.location.pathname.endsWith('checkout.html')) {
    renderCheckoutCart();
  }

  const paidButton = document.getElementById('paidButton');
  if (paidButton) {
    paidButton.addEventListener('click', () => {
      showToast('Payment confirmation sent. Please follow up on WhatsApp.', 'success');
    });
  }

  if (designUploadForm && uploadStatus) {
    designUploadForm.addEventListener('submit', (event) => {
      event.preventDefault();
      uploadStatus.textContent = 'AI Scanning...';
      setTimeout(() => {
        uploadStatus.textContent = 'Pending Owner Approval';
        setTimeout(() => {
          uploadStatus.textContent = 'Live in Shop';
        }, 1800);
      }, 1800);
    });
  }

  if (showRealBtn && showMockupBtn && realPhoto && mockupPhoto) {
    showRealBtn.addEventListener('click', () => {
      realPhoto.classList.add('active');
      mockupPhoto.classList.remove('active');
      showRealBtn.classList.add('active');
      showMockupBtn.classList.remove('active');
    });
    showMockupBtn.addEventListener('click', () => {
      realPhoto.classList.remove('active');
      mockupPhoto.classList.add('active');
      showRealBtn.classList.remove('active');
      showMockupBtn.classList.add('active');
    });
  }

  // Handle sign in form
  const signinForm = document.querySelector('.auth-card form');
  const signinEmail = document.getElementById('signinEmail');
  if (signinForm && signinEmail) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Sign in functionality coming soon. Contact us on WhatsApp for assistance.', 'default');
    });
  }

  // Handle sign up form
  const signupName = document.getElementById('signupName');
  if (signinForm && signupName) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Account registration coming soon. Contact us on WhatsApp to become an agent.', 'default');
    });
  }

  // Handle payout form save
  const payoutSaveBtn = document.querySelector('.payout-form .btn-primary');
  if (payoutSaveBtn) {
    payoutSaveBtn.addEventListener('click', () => {
      const momoNumber = document.getElementById('momoNumber')?.value;
      if (momoNumber && momoNumber.trim()) {
        showToast('Payout number saved successfully!', 'success');
      } else {
        showToast('Please enter a valid Mobile Money number.', 'error');
      }
    });
  }
}

initializePage();
