using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UITour.Models;

namespace UITour.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly UITourContext _context;

        public HomeController(ILogger<HomeController> logger,UITourContext context)
        {
            _logger = logger;
            _context = context; 
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            try
            {
                // Cách 1: Dùng Database.CanConnect()
                bool canConnect = _context.Database.CanConnect();

                if (canConnect)
                    return Content("ok!");
                else
                    return Content("no!");
            }
            catch (Exception ex)
            {
                return Content("error: " + ex.Message);
            }
            return View();
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
