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

  //----------------Cart Functionality----------------------------------------------------------------------------------------------------
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


//-------------------to display the cart-------------------
async function fetchCartItems() {
  axios.get('../../customer/getcartitems')
  .then(response => {
      let cartRows = '';
      response.data.forEach(item => {
          const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : undefined;
          const quantity = typeof item.quantity === 'number' ? item.quantity : undefined;
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
      setupRemoveButtonListeners();
  })
  .catch(error => {
      console.error('Error fetching cart items:', error);
  });
}

//-------------------helper function to display the cart-------------------
function setupRemoveButtonListeners() {
  const cartTable = document.getElementById('cartItems');
  cartTable.addEventListener('click', function(event) {
      if (event.target.classList.contains('remove-item')) {
          const itemId = event.target.getAttribute('data-id');
          removeCartItem(itemId);
      }
  });
}

//-------------------Removing items from cart-------------------
async function removeCartItem(productId) {
  try {
      const response = await axios.delete(`../../api/cart/remove/${productId}`);
      if (response.status === 200) {
          toast("Item Removed", "Item successfully removed from the cart.");
          fetchCartItems(); // Refresh the cart display
      } else {
          throw new Error('Failed to remove the item');
      }
  } catch (error) {
      console.error('Error removing cart item:', error);
      toast("Error", "Failed to remove the item from the cart.");
  }
}

//-------------------Handling Modal Transitions for Cart and Checkout Modals-------------------

document.getElementById('checkoutButton').addEventListener('click', function() {
  fetchCartItems().then(() => {
    populateOrderSummary();  // Function to populate order summary
    $('#checkoutCartModal').modal('hide');
    $('#checkoutProcessModal').modal('show');  // Show the checkout modal
  });
});

function populateOrderSummary() {
  const cartItems = document.getElementById('cartItems').cloneNode(true);
  document.getElementById('orderSummary').innerHTML = '';  // Clear existing summary
  document.getElementById('orderSummary').appendChild(cartItems);
}

// Add event listener to finalize the checkout process
document.getElementById('finalizeCheckoutButton').addEventListener('click', async function() {
  const shippingDetails = {
    shipName: document.getElementById('shipName').value,
    shipAddress: document.getElementById('shipAddress').value,
    shipCity: document.getElementById('shipCity').value,
    shipRegion: document.getElementById('shipRegion').value,
    shipPostalCode: document.getElementById('shipPostalCode').value,
    shipCountry: document.getElementById('shipCountry').value
  };

  try {
    const response = await axios.post('../../api/checkout', { shippingDetails });
    if (response.status === 200) {
      toast("Checkout Successful", "Your order has been placed successfully.");
      $('#checkoutProcessModal').modal('hide');
      // Optionally, redirect to a confirmation page or reset the page state
    } else {
      throw new Error('Checkout failed.');
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    toast("Checkout Error", "There was an issue placing your order. Please try again.");
  }
});