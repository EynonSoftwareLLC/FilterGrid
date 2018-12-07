using System;
using System.Collections.Generic;
using System.Text;

namespace Eynon.FilterGrid
{
    public class GridResult<T>
    {
        public int Page { get; set; }
        public int Pages { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public int Count { get; set; }
        public List<T> Results { get; set; }
        public Dictionary<string, string> Summary { get; set; }

        public string View { get; set; }

        public GridResult()
        {
            Page = 1;
            Pages = 1;
            Total = 0;
            Results = new List<T>();
            PageSize = 25;
            Count = 0;
            Summary = new Dictionary<string, string>();
        }

        public GridResult(List<T> results, int page, int pages, int total, int pageSize)
        {
            Page = page;
            Pages = pages;
            Total = total;
            Results = results;
            PageSize = pageSize;
            Count = results.Count;
            Summary = new Dictionary<string, string>();
        }
    }
}
