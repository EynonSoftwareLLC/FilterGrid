using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace Eynon.FilterGrid
{
    public class Filterable<T> : Sortable<T> where T : class
    {

        public Filterable(Dictionary<string, string> columns) : base(columns)
        {

        }

        public virtual FilterResult<T> Filter(DbContext context, DbSet<T> db, string query, FilterOptions options, string countQuery = null)
        {
            bool is_countQuery = false;
            List<string> fields;
            var summary = options.SummaryQuery;
            ApplyFilter(ref query, options, out is_countQuery, ref countQuery, ref summary, out fields);

            // Total Query
            if (is_countQuery)
            {
                Total = context.Database.SqlQuery<int>(countQuery, fields.ToArray()).Single();
            }
            else
            {
                var results = db.SqlQuery(countQuery, fields.ToArray());
                Total = results.Count();
            }

            var response = new FilterResult<T>();
            response.Results = Sort(db, query, options, fields).ToList();
            response.PageSize = options.PageSize;
            response.Page = options.Page;
            response.Total = Total;

            return response;
        }

        public virtual FilterResult<T> Filter(DbContext context, string query, FilterOptions options, string countQuery = null)
        {
            bool is_countQuery = false;
            List<string> fields;
            var summary = options.SummaryQuery;
            ApplyFilter(ref query, options, out is_countQuery, ref countQuery, ref summary, out fields);
            
            Total = context.Database.SqlQuery<int>(countQuery, fields.ToArray()).Single();

            var response = new FilterResult<T>();
            response.Results = SortCustom(context, query, options, fields).ToList();
            response.PageSize = options.PageSize;
            response.Page = options.Page;
            response.Total = Total;

            return response;
        }

        protected void ApplyFilter(ref string query, FilterOptions options, out bool is_countQuery, ref string countQuery, ref string summaryQuery, out List<string> fields)
        {
            is_countQuery = false;
            string where = "";
            fields = new List<string>();
            bool firstWhere = true;

            if (options.Filter != null)
            {
                foreach (var gf in options.Filter)
                {
                    if (SortableColumns.ContainsKey(gf.Field))
                    {
                        if (firstWhere)
                        {
                            where += " WHERE";
                            firstWhere = false;
                        }
                        else
                        {
                            where += " AND";
                        }
                        switch (gf.Type)
                        {
                            case "string":
                                string like = JsonConvert.DeserializeObject<string>(gf.Data);
                                if (like != null && like != "")
                                {
                                    where += " " + SortableColumns[gf.Field] + " LIKE CONCAT('%', {" + fields.Count + "}, '%')";
                                    fields.Add(like);
                                }
                                else
                                {
                                    where += " 1 = 1";
                                    //query += " (" + SortableColumns[gf.Field] + " IS NULL OR datalength(" + SortableColumns[gf.Field] + ") = 0)";
                                }
                                break;
                            case "list":
                                var item = JsonConvert.DeserializeObject<List<string>>(gf.Data);
                                where += " " + SortableColumns[gf.Field] + " IN (";
                                bool first = true;
                                foreach (var i in item)
                                {
                                    if (!first) where += ",";
                                    first = false;
                                    where += "{" + fields.Count + "}";
                                    fields.Add(i);
                                }

                                where += ")";
                                break;
                            case "bool":
                                int result = JsonConvert.DeserializeObject<int>(gf.Data);
                                where += " " + SortableColumns[gf.Field] + " = " + ((result == 0) ? "0" : "1");
                                break;
                            case "date":
                                DateFilter date = JsonConvert.DeserializeObject<DateFilter>(gf.Data, new JsonSerializerSettings
                                {
                                    NullValueHandling = NullValueHandling.Ignore
                                });
                                if (date.Start != null && date.Start != "")
                                {
                                    var start = DateTime.ParseExact(date.Start, "yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture);
                                    where += " " + SortableColumns[gf.Field] + " >= {" + fields.Count + "}";
                                    fields.Add(start.ToString("yyyy-MM-ddTHH:mm:ss"));
                                    if (date.End != null & date.End != "") where += " AND";
                                }
                                if (date.End != null & date.End != "")
                                {
                                    var stop = DateTime.ParseExact(date.End, "yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture);
                                    where += " " + SortableColumns[gf.Field] + " <= {" + fields.Count + "}";
                                    fields.Add(stop.ToString("yyyy-MM-ddTHH:mm:ss"));
                                }

                                if ((date.Start == null || date.Start == "") && (date.End == null || date.End == ""))
                                {
                                    //where += " (" + SortableColumns[gf.Field] + " IS NULL OR " + SortableColumns[gf.Field] + " = '')";
                                    where += "(1 = 1)";
                                }
                                break;
                        }
                    }
                }
            }

            if (options.AdditionalFilters != null && options.AdditionalFilters.Count > 0)
            {
                foreach (var f in options.AdditionalFilters)
                {
                    if (firstWhere)
                    {
                        firstWhere = false;
                        where += " WHERE";
                    }
                    else
                    {
                        where += " AND";
                    }

                    where += " " + f;
                }
            }

            query += where;

            if (options.AggregateQuery != null)
                query += " " + options.AggregateQuery;

            is_countQuery = true;
            if (countQuery == null) countQuery = "SELECT count(1) FROM (" + query + ") as COUNT";
            else
            {
                is_countQuery = true;
                countQuery += where;

                if (options.AggregateQuery != null)
                    countQuery += " " + options.AggregateQuery;
            }

            if (summaryQuery != null)
            {
                summaryQuery += where;

                //if (options.AggregateQuery != null)
                    //summaryQuery += " " + options.AggregateQuery;
            }
        }
    }

    public class Filterable<T, T2> : Filterable<T> 
        where T : class
        where T2 : class
    {
        public Filterable(Dictionary<string, string> columns) : base(columns)
        {

        }

        public override FilterResult<T> Filter(DbContext context, DbSet<T> db, string query, FilterOptions options, string countQuery = null)
        {
            bool is_countQuery = false;
            List<string> fields;
            var summary = options.SummaryQuery;
            ApplyFilter(ref query, options, out is_countQuery, ref countQuery, ref summary, out fields);

            // Total Query
            if (is_countQuery)
            {
                Total = context.Database.SqlQuery<int>(countQuery, fields.ToArray()).Single();
            }
            else
            {
                var results = db.SqlQuery(countQuery, fields.ToArray());
                Total = results.Count();
            }

            var response = new FilterResult<T, T2>();
            response.Results = Sort(db, query, options, fields).ToList();
            response.PageSize = options.PageSize;
            response.Page = options.Page;
            response.Total = Total;

            if (summary != null)
            {
                response.SummaryResults = GetSummary(context, summary, fields).ToList();
            }

            return response;
        }

        private IEnumerable<T2> GetSummary(DbContext context, string summary, List<string> fields)
        {
            if (fields.Count > 0)
            {
                return context.Database.SqlQuery<T2>(summary, fields.ToArray());
            }

            return context.Database.SqlQuery<T2>(summary);
        }

        public override FilterResult<T> Filter(DbContext context, string query, FilterOptions options, string countQuery = null)
        {
            bool is_countQuery = false;
            List<string> fields;
            var summary = options.SummaryQuery;
            ApplyFilter(ref query, options, out is_countQuery, ref countQuery, ref summary, out fields);

            Total = context.Database.SqlQuery<int>(countQuery, fields.ToArray()).Single();

            var response = new FilterResult<T, T2>();
            response.Results = SortCustom(context, query, options, fields).ToList();
            response.PageSize = options.PageSize;
            response.Page = options.Page;
            response.Total = Total;

            if (summary != null)
            {
                response.SummaryResults = GetSummary(context, summary, fields).ToList();
            }

            return response;
        }
    }
}