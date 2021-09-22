const cartItems = document.querySelector('.cart__items');
const loadinSection = document.querySelector('.loading-section');

function loadingAPI() {
  if (loadinSection.children.length === 0) {
    const loading = document.createElement('h1');
    loading.className = 'loading';
    loading.innerText = 'loading...';
    loadinSection.appendChild(loading);
  } else {
  loadinSection.removeChild(document.querySelector('.loading'));
  }
}

function cleanLocalStorage() {
  localStorage.setItem('cartProducts', JSON.stringify([]));
}

function handleEmptyCartButton() {
  const emptyCart = document.querySelector('.empty-cart');

  emptyCart.addEventListener('click', () => {
    cartItems.innerText = '';
    cleanLocalStorage();
   });
}

function addItemToLocalStorage(product) {
  const localStorageList = JSON.parse(localStorage.getItem('cartProducts'));
  localStorageList.push(product);
  localStorage.setItem('cartProducts', JSON.stringify(localStorageList));
}

function updateLocalStorage(arrayOfIds) {
  arrayOfIds.forEach((itemId) => {
    fetch(`https://api.mercadolibre.com/items/${itemId}`)
    .then((response) => response.json())
    .then(({ id, title, price }) => {
      const product = { sku: id, name: title, salePrice: price };

      addItemToLocalStorage(product);
    });
  });
}

function getLocalStorageIds() {
  const arrayOfIds = cartItems.innerText.split('\n').map((element) => [element])
    .map((arrays) => arrays.map((array) => (array
      .split(' | ')).map((element) => element
        .split(': ')[1])[0]).join());

  updateLocalStorage(arrayOfIds);
}

function cartItemClickListener(event) {
  event.target.remove();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', (event) => {
    cartItemClickListener(event);
    cleanLocalStorage();
    if (cartItems.children.length > 0) {
    getLocalStorageIds();
    }
  });
  return li;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function addProduct(event) {
  loadingAPI();
  const itemId = getSkuFromProductItem(event.target.parentElement);
  fetch(`https://api.mercadolibre.com/items/${itemId}`)
    .then((response) => response.json())
    .then(({ id, title, price }) => {
      const product = { sku: id, name: title, salePrice: price };
      const cartItem = createCartItemElement(product);
      cartItems.appendChild(cartItem);
      
      addItemToLocalStorage(product);
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

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function createProductList() {
  loadingAPI();
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((response) => response.json())
  .then(({ results }) => results
    .forEach(({ id, title, thumbnail }) => {
      const product = { sku: id, name: title, image: thumbnail };
      const productItem = createProductItemElement(product);
      document.querySelector('.items').appendChild(productItem);
    }))
    .then(() => loadingAPI());
}

function initialRenderization() {
  if (!localStorage.getItem('cartProducts')) {
    cleanLocalStorage();
  }
  const localStorageList = JSON.parse(localStorage.getItem('cartProducts'));
  localStorageList.forEach((product) => {
    createCartItemElement(product);
    cartItems.appendChild(createCartItemElement(product));
  });
}

window.onload = () => {
  createProductList();
  handleEmptyCartButton();
  initialRenderization();
};
