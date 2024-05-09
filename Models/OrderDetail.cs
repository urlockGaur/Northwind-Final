using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


public class OrderDetail
{
    [Key]
    public int OrderDetailsId { get; set; }
    public int OrderId { get; set; }
    public int ProductID { get; set; }
    public decimal UnitPrice { get; set; }
    public short Quantity { get; set; }
    public float Discount { get; set; }

    // Navigation properties
    public virtual Order Order { get; set; }
    public virtual Product Product { get; set; }
}