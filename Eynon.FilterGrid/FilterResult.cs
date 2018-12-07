using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eynon.FilterGrid
{
    public class FilterResult<T>
    {
        public List<T> Results { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public int TotalPages
        {
            get
            {
                return (int)Math.Ceiling((double)((double)Total / (double)PageSize));
            }
        }
    }

    public class FilterResult<T,T2> : FilterResult<T>
    {
        public List<T2> SummaryResults { get; set; }
    }
}
