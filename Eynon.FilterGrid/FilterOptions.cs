using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eynon.FilterGrid
{
    public class FilterOptions
    {
        public string DefaultOrderColumn { get; set; }
        public List<GridSort> Order { get; set; }
        public List<GridFilter> Filter { get; set; }
        public List<string> AdditionalFilters { get; set; }
        public string AggregateQuery { get; set; }
        public string SummaryQuery { get; set; }
        public Type SummaryResultType { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public FilterOptions(string defaultOrderColumn)
        {
            DefaultOrderColumn = defaultOrderColumn;
            AdditionalFilters = new List<string>();
            Filter = new List<GridFilter>();
            Order = new List<GridSort>();
        }
    }
}
