using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SFQ.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var token = ConfigurationManager.AppSettings["MixpanelToken"];
            Console.WriteLine(token);
             return View();
        }

        public ActionResult TileMap()
        {
            var path = Server.MapPath("/Content/tilemap.json");
            return Content(System.IO.File.ReadAllText(path));
        }
        
        public ActionResult Levels()
        {
            var path = Server.MapPath("/Content/levels.json");
            return Content(System.IO.File.ReadAllText(path));
        }
    }
}