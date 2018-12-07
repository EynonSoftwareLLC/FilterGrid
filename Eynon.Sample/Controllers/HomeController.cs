using AutoMapper;
using Eynon.FilterGrid;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Eynon.Sample.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public JsonResult GridResults(GridFilterModel model)
        {

            var result = Filter(model.ToOptions());
            result.View = PartialToString("Partials/Index", result);
            return Json(result);
        }

        private GridResult<Models.FIPS> Filter(FilterOptions options)
        {
            var query = "SELECT * FROM FIPS";
            // Providing a separate count query is not required. However, it may greatly increase query performance.
            var countQuery = "SELECT count(1) FROM FIPS";
            options.DefaultOrderColumn = "FIPS.State";

            //  White List Columns
            var columns = new Dictionary<string, string>
            {
                { "STATE", "FIPS.State" },
                { "StateFP", "FIPS.StateFP" },
                { "CountyFP", "FIPS.CountyFP" },
                { "County", "FIPS.CountyName" },
                { "ClassFP", "FIPS.CLASSFP" },
            };

            var table = new Filterable<Models.FIPS>(columns);
            using (var db = new SampleDAL.Main())
            {
                //options.AdditionalFilters = new List<string>() { "Suppliers.IsDeleted = 0" };
                var result = table.Filter(db, query, options, countQuery);
                return new GridResult<Models.FIPS>(Mapper.Map<List<Models.FIPS>>(result.Results), result.Page, result.TotalPages, result.Total, result.PageSize);
            }
        }
        
        public string PartialToString(string viewName, object model)
        {
            using (var sw = new StringWriter())
            {
                // Create an MVC Controller Context
                var wrapper = new HttpContextWrapper(System.Web.HttpContext.Current);

                RouteData routeData = new RouteData();

                routeData.Values.Add("controller", this.GetType().Name
                                                            .ToLower()
                                                            .Replace("controller", ""));

                this.ControllerContext = new ControllerContext(wrapper, routeData, this);

                this.ViewData.Model = model;

                var viewResult = ViewEngines.Engines.FindPartialView(this.ControllerContext, viewName);

                var viewContext = new ViewContext(this.ControllerContext, viewResult.View, this.ViewData, this.TempData, sw);
                viewResult.View.Render(viewContext, sw);

                return sw.ToString();
            }
        }
    }
}