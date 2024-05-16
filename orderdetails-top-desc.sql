SELECT TOP (1000) 
    [OrderDetailsId],
    [OrderId],
    [ProductId],
    [UnitPrice],
    [Quantity],
    [Discount]
FROM 
    [NorthwindProject_17_AMF].[dbo].[OrderDetails]
ORDER BY 
    [OrderId] DESC;