using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eynon.FilterGrid
{

    public class GridFilterModel
    {
        public bool? NewFilter { get; set; }
        public List<GridSort> Order { get; set; }

        public List<GridFilter> Filter { get; set; }

        public int Page { get; set; }
        public int PageSize { get; set; }

        public GridFilterModel()
        {

        }

        public FilterOptions ToOptions()
        {
            FilterOptions options = new FilterOptions("");
            options.Filter = Filter;
            options.Order = Order;
            options.Page = Page;
            options.PageSize = PageSize;
            return options;
        }
    }
}
