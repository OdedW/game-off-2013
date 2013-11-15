using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFQ.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult TileMap()
        {
            var path = Server.MapPath("/Content/tilemap.json");
            return Content(System.IO.File.ReadAllText(path));
        }
    }
}