public class CheckoutModel {
    public int CustomerId { get; set; }
    public ShippingDetails ShippingDetails { get; set; }
    public List<CartItemModel> CartItems { get; set; }
}