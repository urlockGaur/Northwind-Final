using Microsoft.AspNetCore.Mvc;

namespace Northwind.Controllers
{

    public class APIController(DataContext db) : Controller
    {
        // this controller depends on the NorthwindRepository
        private readonly DataContext _dataContext = db;

        [HttpGet, Route("api/product")]
        // returns all products
        public IEnumerable<Product> Get() => _dataContext.Products.OrderBy(p => p.ProductName);
        [HttpGet, Route("api/product/{id}")]
        // returns specific product
        public Product Get(int id) => _dataContext.Products.FirstOrDefault(p => p.ProductId == id);
        [HttpGet, Route("api/product/discontinued/{discontinued}")]
        // returns all products where discontinued = true/false
        public IEnumerable<Product> GetDiscontinued(bool discontinued) => _dataContext.Products.Where(p => p.Discontinued == discontinued).OrderBy(p => p.ProductName);
        [HttpGet, Route("api/category/{CategoryId}/product")]
        // returns all products in a specific category
        public IEnumerable<Product> GetByCategory(int CategoryId) => _dataContext.Products.Where(p => p.CategoryId == CategoryId).OrderBy(p => p.ProductName);
        [HttpGet, Route("api/category/{CategoryId}/product/discontinued/{discontinued}")]
        // returns all products in a specific category where discontinued = true/false
        public IEnumerable<Product> GetByCategoryDiscontinued(int CategoryId, bool discontinued) => _dataContext.Products.Where(p => p.CategoryId == CategoryId && p.Discontinued == discontinued).OrderBy(p => p.ProductName);

        [HttpPost, Route("api/addtocart")]
        // adds a row to the cartitem table
        public CartItem Post([FromBody] CartItemJSON cartItem) => _dataContext.AddToCart(cartItem);

        [HttpDelete, Route("api/cart/remove/{ProductId}")]
        [HttpDelete("cart/remove/{ProductId}")]
        public IActionResult RemoveFromCart(int productId)
        {
            try
            {
                // Attempt to remove the cart item
                if (!_dataContext.RemoveCartItem(productId))
                {
                    // Log that the item was not found
                    Console.WriteLine($"Item with productId {productId} not found.");
                    return NotFound(new { message = "Item not found" });
                }

                // Attempt to save changes to the database
                _dataContext.SaveChanges();

                // Return a success response
                return Ok(new { message = "Item removed successfully" });
            }
            catch (Exception ex)
            {
                // Log the general exception details for debugging purposes
                Console.WriteLine($"An error occurred while removing the item: {ex.Message}");
                Console.WriteLine(ex.StackTrace);

                // Return a server error response with the exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while removing the item", detail = ex.Message });
            }
        }

        [HttpPost, Route("api/checkout")]
        public IActionResult Checkout([FromBody] CheckoutModel checkoutModel)
        {
            // Step 1: Validate Shipping Details
            if (string.IsNullOrWhiteSpace(checkoutModel.ShippingDetails.ShipName) ||
                string.IsNullOrWhiteSpace(checkoutModel.ShippingDetails.ShipAddress) ||
                string.IsNullOrWhiteSpace(checkoutModel.ShippingDetails.ShipCity) ||
                string.IsNullOrWhiteSpace(checkoutModel.ShippingDetails.ShipPostalCode) ||
                string.IsNullOrWhiteSpace(checkoutModel.ShippingDetails.ShipCountry))
            {
                return BadRequest("All shipping details must be provided.");
            }

            // Step 2: Create an Order
            var order = new Order
            {
                CustomerId = checkoutModel.CustomerId,
                OrderDate = DateTime.Now,
                RequiredDate = DateTime.Now.AddDays(7), // Example: required date is a week from order date
                ShippedDate = null, // Initially null
                ShipVia = 1, // default shipping method?
                ShipAddress = checkoutModel.ShippingDetails.ShipAddress,
                ShipCity = checkoutModel.ShippingDetails.ShipCity,
                ShipRegion = checkoutModel.ShippingDetails.ShipRegion,
                ShipPostalCode = checkoutModel.ShippingDetails.ShipPostalCode,
                ShipCountry = checkoutModel.ShippingDetails.ShipCountry
            };
            _dataContext.Orders.Add(order);
            _dataContext.SaveChanges();

            // Step 3: Create OrderDetails
            foreach (var item in checkoutModel.CartItems)
            {
                var orderDetail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                    Discount = item.Discount
                };
                _dataContext.OrderDetails.Add(orderDetail);

                // Step 4: Adjust Stock Levels
                var product = _dataContext.Products.FirstOrDefault(p => p.ProductId == item.ProductId);
                if (product != null)
                {
                    product.UnitsInStock -= (short)item.Quantity;
                }
            }

            // Save changes for OrderDetails and stock adjustment
            _dataContext.SaveChanges();

            // Step 5: Clear Cart Items
            var cartItems = _dataContext.CartItems.Where(ci => ci.CustomerId == checkoutModel.CustomerId);
            _dataContext.CartItems.RemoveRange(cartItems);
            _dataContext.SaveChanges();

            return Ok("Order placed successfully");
        }
    }
}