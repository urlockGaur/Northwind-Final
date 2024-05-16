public class Order
{
    public int OrderId { get; set; }  // Primary key
    public int CustomerId { get; set; }  // Foreign key to Customer table
    public int? EmployeeId { get; set; }  // Foreign key to Employee table (nullable)
    public DateTime OrderDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    public int? ShipVia { get; set; }
    public string ShipAddress { get; set; }
    public string ShipCity { get; set; }
    public string ShipRegion { get; set; }
    public string ShipPostalCode { get; set; }
    public string ShipCountry { get; set; }

    // Navigation properties
    public ICollection<OrderDetail> OrderDetails { get; set; }  // Link to OrderDetails
}