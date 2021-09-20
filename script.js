function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  return event.target.remove();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function addProduct(event) {
  const itemID = getSkuFromProductItem(event.target.parentElement);
  fetch(`https://api.mercadolibre.com/items/${itemID}`)
    .then((response) => response.json())
    .then(({ id, title, price }) => {
      const product = { sku: id, name: title, salePrice: price };
      const cartItem = createCartItemElement(product);
      document.querySelector('.cart__items').appendChild(cartItem);
    });
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
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((response) => response.json())
  .then(({ results }) => results
    .forEach(({ id, title, thumbnail }) => {
      const product = { sku: id, name: title, image: thumbnail };
      const productItem = createProductItemElement(product);
      document.querySelector('.items').appendChild(productItem);
    }));
}

function handleEmptyCartButton() {
  const cartItems = document.querySelector('.cart__items');
  const emptyCart = document.querySelector('.empty-cart');

  emptyCart.addEventListener('click', () => {
    cartItems.innerText = '';
   });
}

window.onload = () => {
  createProductList();
  handleEmptyCartButton();
};
