SELECT TOP (1000) 
    [OrderId],
    [CustomerId],
    [EmployeeId],
    [OrderDate],
    [RequiredDate],
    [ShippedDate],
    [ShipVia],
    [Freight],
    [ShipName],
    [ShipAddress],
    [ShipCity],
    [ShipRegion],
    [ShipPostalCode],
    [ShipCountry]
FROM 
    [NorthwindProject_17_AMF].[dbo].[Orders]
ORDER BY 
    [OrderDate] DESC;