const items = document.querySelector('.items');
const cartItems = document.querySelector('.cart__items');
const totalPrice = document.querySelector('.total-price');
const loadingSection = document.querySelector('.loading-section');

const setItem = (key, value) => localStorage.setItem(`${key}`, JSON.stringify(value));
const getItem = (key) => JSON.parse(localStorage.getItem(`${key}`)) || [];
const cleanLocalStorage = (key) => setItem(key, []);
const cartItemClickListener = ({ target }) => target.remove();
const getSkuFromProductItem = (item) => item.querySelector('span.item__sku').innerText;

function loadingAPI() {
  if (loadingSection.children.length !== 0) {
    return loadingSection.removeChild(document.querySelector('.loading'));
  }
  const loading = document.createElement('h1');
  loading.className = 'loading';
  loading.innerText = 'loading...';
  loading.style.position = 'fixed';
  loadingSection.appendChild(loading);
}

function handleEmptyCartButton() {
  const emptyCart = document.querySelector('.empty-cart');

  emptyCart.addEventListener('click', () => {
    cartItems.innerText = '';
    totalPrice.innerText = 0;
    cleanLocalStorage('localStorageCartItems');
    cleanLocalStorage('localStorageTotalPrice');
   });
}

function addItemToLocalStorage(arrayItem, key) {
  const localStorageItem = getItem(key);
  localStorageItem.push(arrayItem);
  setItem(key, localStorageItem);
}

function updateLocalStorageCartItems() {
  if (cartItems.children.length > 0) {
    setItem('localStorageCartItems', cartItems.innerText.split('\n'));
  } else {
    cleanLocalStorage('localStorageCartItems');
  }
}

function getTotalPrice(key) {
  totalPrice.innerText = `${parseFloat(getItem(key)
    .reduce((cur, acc) => cur + acc, 0).toFixed(2))}`;
}

function createCartItemElement(product) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = product;
  li.style.padding = '10px 0';
  li.addEventListener('click', ({ target }) => {
    const index = [...target.parentElement.children].indexOf(li);

    const localPriceArray = getItem('localStorageTotalPrice');

    cartItemClickListener({ target });
    
    localPriceArray.splice(index, 1);

    setItem('localStorageTotalPrice', localPriceArray);
    getTotalPrice('localStorageTotalPrice');
    updateLocalStorageCartItems();
  });
  return li;
}

async function addProduct({ target }) {
  loadingAPI();
  const itemId = getSkuFromProductItem(target.parentElement);
  const response = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
  const item = await response.json();
  const { id, title, price } = item;
  const product = `SKU: ${id} | NAME: ${title} | PRICE: $${price}`;
  
  cartItems.appendChild(createCartItemElement(product));

  addItemToLocalStorage(product, 'localStorageCartItems');
  addItemToLocalStorage(price, 'localStorageTotalPrice');

  getTotalPrice('localStorageTotalPrice');
  
  loadingAPI();
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  if (element === 'button') {
    e.addEventListener('click', (event) => addProduct(event));
  }
  return e;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createProductItemElement({ sku, name, image, salePrice }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add',
    `Adicionar ao carrinho! \n $${salePrice}`));

  return section;
}

function createProductObject(products) {
  products.results.forEach(({ id, title, thumbnail, price }) => {
    const product = { sku: id, name: title, image: thumbnail, salePrice: price };
    const productItem = createProductItemElement(product);
    items.appendChild(productItem);
  });
}

async function createProductList() {
  loadingAPI();
  const response = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador');
  const products = await response.json();

  createProductObject(products);

  loadingAPI();
}

const searchButton = document.querySelector('#search-button');
const input = document.querySelector('#input');

async function searchProductList() {
  loadingAPI();
  const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${input.value}`);
  const products = await response.json();
  if (products.results.length > 0) {
    createProductObject(products);
  } else {
    const message = 'Não encontramos produtos que correspondem à sua busca!';
    items.appendChild(createCustomElement('span', 'message', message));
  }
  input.value = '';
  loadingAPI();
}

function handleSearchButton() {
  searchButton.addEventListener('click', () => {
    if (input.value.length > 0) {
      items.innerHTML = '';
      searchProductList();
    }
  });
}

function getInitialRenderization(key) {
  if (!localStorage.getItem(`${key}`)) {
    setItem(key, []);
  }
}

function getCartItemsRederization(key) {
  getInitialRenderization(key);

  getItem(key)
    .forEach((item) => {
      createCartItemElement(item);
      cartItems.appendChild(createCartItemElement(item));
    });
}

function getTotalPriceRenderization(key) {
  getInitialRenderization(key);
  getTotalPrice(key);
}

window.onload = () => {
  createProductList();
  handleEmptyCartButton();
  getCartItemsRederization('localStorageCartItems');
  getTotalPriceRenderization('localStorageTotalPrice');
  handleSearchButton();
};
