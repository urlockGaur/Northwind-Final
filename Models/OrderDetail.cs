public class OrderDetail
{
    public int OrderDetailsId { get; set; }  // Primary key
    public int OrderId { get; set; }  // Foreign key to Orders table
    public int ProductId { get; set; }  // Foreign key to Products table
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public float Discount { get; set; }

    // Navigation properties
    public Order Order { get; set; }  // Link back to Order
    public Product Product { get; set; }  // Link to Product
}