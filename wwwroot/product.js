document.addEventListener("DOMContentLoaded", function() {
    fetchProducts();
  });
  document.getElementById("CategoryId").addEventListener("change", (e) => {
    document.getElementById('product_rows').dataset['id'] = e.target.value;
    fetchProducts();
  });
  document.getElementById('Discontinued').addEventListener("change", (e) => {
    fetchProducts();
  });
  // delegated event listener
  document.getElementById('product_rows').addEventListener("click", (e) => {
    p = e.target.parentElement;
    if (p.classList.contains('product')) {
      e.preventDefault()
      // console.log(p.dataset['id']);
      if (document.getElementById('User').dataset['customer'].toLowerCase() == "true") {
        document.getElementById('ProductId').innerHTML = p.dataset['id'];
        document.getElementById('ProductName').innerHTML = p.dataset['name'];
        document.getElementById('UnitPrice').innerHTML = Number(p.dataset['price']).toFixed(2);
        display_total();
        const cart = new bootstrap.Modal('#cartModal', {}).show();
      } else {
        // alert("Only signed in customers can add items to the cart");
        toast("Access Denied", "You must be signed in as a customer to access the cart.");
      }
    }
  });
  const toast = (header, message) => {
    document.getElementById('toast_header').innerHTML = header;
    document.getElementById('toast_body').innerHTML = message;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast')).show();
  }
  const display_total = () => {
    const total = parseInt(document.getElementById('Quantity').value) * Number(document.getElementById('UnitPrice').innerHTML);
    document.getElementById('Total').innerHTML = numberWithCommas(total.toFixed(2));
  }
  // update total when cart quantity is changed
  document.getElementById('Quantity').addEventListener("change", (e) => {
    display_total();
  });
  // function to display commas in number
  const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  async function fetchProducts() {
    const id = document.getElementById('product_rows').dataset['id'];
    const discontinued = document.getElementById('Discontinued').checked ? "" : "/discontinued/false";
    const { data: fetchedProducts } = await axios.get(`../../api/category/${id}/product${discontinued}`);
    // console.log(fetchedProducts);
    let product_rows = "";
    fetchedProducts.map(product => {
      const css = product.discontinued ? " discontinued" : "";
      product_rows += 
        `<tr class="product${css}" data-id="${product.productId}" data-name="${product.productName}" data-price="${product.unitPrice}">
          <td>${product.productName}</td>
          <td class="text-end">${product.unitPrice.toFixed(2)}</td>
          <td class="text-end">${product.unitsInStock}</td>
        </tr>`;
    });
    document.getElementById('product_rows').innerHTML = product_rows;
  }
  document.getElementById('addToCart').addEventListener("click", (e) => {
    // hide modal
    const cart = bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
    // use axios post to add item to cart
    item = {
      "id": Number(document.getElementById('ProductId').innerHTML),
      "email": document.getElementById('User').dataset['email'],
      "qty": Number(document.getElementById('Quantity').value)
    }
    postCartItem(item);
  });
  async function postCartItem(item) {
    axios.post('../../api/addtocart', item).then(res => {
      toast("Product Added", `${res.data.product.productName} successfully added to cart.`);
      fetchCartItems();
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var cartButton = document.querySelector('.cart-indicator button');
    cartButton.addEventListener('click', function() {
        fetchCartItems(); // Fetch the latest cart items
        updateCartCount(); // Optionally update the cart count if it's dynamic
    });
});

async function fetchCartItems() {
  axios.get('../../customer/getcartitems')
  .then(response => {
      console.log("Cart Items fetched:", response.data); // Check what data is received
      let cartRows = '';
      console.log(response.data);
      response.data.forEach(item => {
        // Ensure that unitPrice and quantity are numbers; otherwise, set them to undefined
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : undefined;
        const quantity = typeof item.quantity === 'number' ? item.quantity : undefined;
    
        // Calculate total price only if both unitPrice and quantity are valid numbers
        const totalPrice = (unitPrice !== undefined && quantity !== undefined) ? (quantity * unitPrice).toFixed(2) : 'N/A';
    
        cartRows += `
            <tr>
                <td>${item.productName}</td>
                <td>$${unitPrice !== undefined ? unitPrice.toFixed(2) : 'N/A'}</td>
                <td>
                    <input type="number" value="${quantity !== undefined ? quantity : 1}" min="1" class="form-control qty" data-id="${item.productId}">
                </td>
                <td>$${totalPrice}</td>
                <td>
                    <button class="btn btn-danger remove-item" data-id="${item.productId}">Remove</button>
                </td>
            </tr>
        `;
    });
      document.getElementById('cartItems').innerHTML = cartRows;
  })
  .catch(error => {
      console.error('Error fetching cart items:', error);
  });
}
