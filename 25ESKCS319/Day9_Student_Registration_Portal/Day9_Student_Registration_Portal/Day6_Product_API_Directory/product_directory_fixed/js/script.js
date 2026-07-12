const API_URL = "https://dummyjson.com/products?limit=100";

const state = {
  products: [],
  query: "",
  category: "all",
  sort: "default"
};

const productsGrid = document.getElementById("productsGrid");
const statusArea = document.getElementById("statusArea");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");
const categoryButton = document.getElementById("categoryButton");
const categoryMenu = document.getElementById("categoryMenu");
const sortButton = document.getElementById("sortButton");
const sortMenu = document.getElementById("sortMenu");
const refreshBtn = document.getElementById("refreshBtn");
const template = document.getElementById("productTemplate");

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function buildStars(rating) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function getFilteredProducts() {
  let products = state.products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(state.query.toLowerCase());
    const matchesCategory = state.category === "all" || product.category === state.category;
    return matchesSearch && matchesCategory;
  });

  switch (state.sort) {
    case "name-az":
      products = [...products].sort((a,b) => a.title.localeCompare(b.title));
      break;
    case "name-za":
      products = [...products].sort((a,b) => b.title.localeCompare(a.title));
      break;
    case "price-low":
      products = [...products].sort((a,b) => a.price - b.price);
      break;
    case "price-high":
      products = [...products].sort((a,b) => b.price - a.price);
      break;
    case "rating-high":
      products = [...products].sort((a,b) => b.rating - a.rating);
      break;
  }

  return products;
}

function showLoading() {
  productsGrid.innerHTML = "";
  productCount.textContent = "0";
  statusArea.innerHTML = `
    <div class="status-card">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Fetching live products...</p>
    </div>
  `;
}

function showError(message) {
  productsGrid.innerHTML = "";
  productCount.textContent = "0";
  statusArea.innerHTML = `
    <div class="status-card error-card">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <h2 class="h5">Unable to load products</h2>
      <p>${message}</p>
      <button id="retryBtn" class="btn btn-primary mt-3">
        <i class="bi bi-arrow-clockwise me-1"></i> Retry
      </button>
    </div>
  `;
  document.getElementById("retryBtn").addEventListener("click", fetchProducts);
}

function populateCategories() {
  const categories = [...new Set(state.products.map(product => product.category))].sort();

  categoryMenu.innerHTML = `
    <li>
      <button class="dropdown-item active" type="button" data-value="all">
        All categories
      </button>
    </li>
  `;

  categories.forEach(category => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "dropdown-item";
    button.type = "button";
    button.dataset.value = category;
    button.textContent = category.replaceAll("-", " ");
    li.appendChild(button);
    categoryMenu.appendChild(li);
  });
}

function openModal(product) {
  document.getElementById("modalTitle").textContent = product.title;
  document.getElementById("modalImage").src = product.thumbnail;
  document.getElementById("modalImage").alt = product.title;
  document.getElementById("modalCategory").textContent = product.category;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalBrand").textContent = product.brand || "Not specified";
  document.getElementById("modalRating").textContent = `${product.rating} / 5`;
  document.getElementById("modalStock").textContent = `${product.stock} units`;
  document.getElementById("modalPrice").textContent = formatPrice(product.price);
}

function renderProducts() {
  const products = getFilteredProducts();
  productsGrid.innerHTML = "";
  statusArea.innerHTML = "";
  productCount.textContent = products.length;

  if (!products.length) {
    statusArea.innerHTML = `
      <div class="status-card empty-card">
        <i class="bi bi-search"></i>
        <h2 class="h5">No products found</h2>
        <p>Try another search term or category.</p>
      </div>
    `;
    return;
  }

  products.forEach((product, index) => {
    const card = template.content.cloneNode(true);
    const column = card.querySelector(".product-column");
    const article = card.querySelector(".product-card");

    article.style.animationDelay = `${Math.min(index * 35, 320)}ms`;

    const discountedPrice = product.price * (1 - product.discountPercentage / 100);

    const image = card.querySelector(".product-image");
    image.src = product.thumbnail;
    image.alt = product.title;

    card.querySelector(".discount-badge").textContent = `-${product.discountPercentage.toFixed(0)}%`;
    card.querySelector(".category-badge").textContent = product.category.replaceAll("-", " ");
    card.querySelector(".product-title").textContent = product.title;
    card.querySelector(".product-description").textContent = product.description;
    card.querySelector(".stars").textContent = buildStars(product.rating);
    card.querySelector(".rating-value").textContent = product.rating.toFixed(1);
    card.querySelector(".price").textContent = formatPrice(discountedPrice);
    card.querySelector(".old-price").textContent = formatPrice(product.price);
    card.querySelector(".stock-badge").textContent = `${product.stock} in stock`;

    card.querySelector(".view-btn").addEventListener("click", () => openModal(product));

    productsGrid.appendChild(column);
  });
}

async function fetchProducts() {
  showLoading();
  refreshBtn.disabled = true;
  refreshBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Loading`;

  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data.products)) {
        throw new Error("Invalid API response");
      }
      state.products = data.products;
      populateCategories();
      renderProducts();
    })
    .catch(error => {
      console.error(error);
      showError("Please check your internet connection and try again.");
    })
    .finally(() => {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = `<i class="bi bi-arrow-clockwise me-1"></i> Refresh`;
    });
}

searchInput.addEventListener("input", e => {
  state.query = e.target.value;
  renderProducts();
});

categoryMenu.addEventListener("click", event => {
  const item = event.target.closest(".dropdown-item");
  if (!item) return;

  state.category = item.dataset.value;
  categoryButton.querySelector("span").textContent = item.textContent.trim();

  categoryMenu.querySelectorAll(".dropdown-item").forEach(button => {
    button.classList.toggle("active", button === item);
  });

  renderProducts();
});

sortMenu.addEventListener("click", event => {
  const item = event.target.closest(".dropdown-item");
  if (!item) return;

  state.sort = item.dataset.value;
  sortButton.querySelector("span").textContent = item.textContent.trim();

  sortMenu.querySelectorAll(".dropdown-item").forEach(button => {
    button.classList.toggle("active", button === item);
  });

  renderProducts();
});

refreshBtn.addEventListener("click", fetchProducts);

fetchProducts();
