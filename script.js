const cartItems = document.querySelector('.cart__items');
const totalPrice = document.querySelector('.total-price');
const loadingSection = document.querySelector('.loading-section');

const setItem = (key, value) => localStorage.setItem(`${key}`, JSON.stringify(value));
const getItem = (key) => JSON.parse(localStorage.getItem(`${key}`));
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
  return cartItems.children.length > 0 
  ? setItem('localStorageCartItems', cartItems.innerText.split('\n'))
  : cleanLocalStorage('localStorageCartItems');
}

function getTotalPrice(key) {
  totalPrice.innerText = `${parseFloat(getItem(key)
    .reduce((cur, acc) => cur + acc, 0).toFixed(2))}`;
}

function createCartItemElement(product) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = product;
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

function addProduct({ target }) {
  loadingAPI();
  const itemId = getSkuFromProductItem(target.parentElement);
  fetch(`https://api.mercadolibre.com/items/${itemId}`)
    .then((response) => response.json())
    .then(({ id, title, price }) => {
      const product = `SKU: ${id} | NAME: ${title} | PRICE: $${price}`;
      
      cartItems.appendChild(createCartItemElement(product));

      addItemToLocalStorage(product, 'localStorageCartItems');
      addItemToLocalStorage(price, 'localStorageTotalPrice');

      getTotalPrice('localStorageTotalPrice');
    })
    .then(() => loadingAPI());
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
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

function createProductList() {
  loadingAPI();
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((response) => response.json())
  .then(({ results }) => results
    .forEach(({ id, title, thumbnail, price }) => {
      const product = { sku: id, name: title, image: thumbnail, salePrice: price };
      const productItem = createProductItemElement(product);
      document.querySelector('.items').appendChild(productItem);
    }))
    .then(() => loadingAPI());
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
};
