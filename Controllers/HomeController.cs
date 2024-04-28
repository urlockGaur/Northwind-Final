using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Northwind.Controllers
{
    public class HomeController : Controller
    {
        private readonly DataContext _dataContext;

        public HomeController(DataContext db)
        {
            _dataContext = db;
        }

        public ActionResult Index()
        {
            // Check if an order has just been submitted
            ViewBag.OrderSubmitted = TempData["OrderSubmitted"] ?? false;

            // Fetch active discounts to pass to the view
            var discounts = _dataContext.Discounts
                            .Include(d => d.Product) // Use lambda instead of string for better type safety
                            .Where(d => d.StartTime <= DateTime.Now && d.EndTime > DateTime.Now)
                            .Take(3)
                            .ToList();

            return View(discounts);
        }
    }
}