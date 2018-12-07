using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web;

namespace Eynon.FilterGrid
{
    public class Sortable<T> where T : class
    {
        public enum DatabaseType
        {
            MSSQL = 1,
            MYSQL = 2
        }

        public const DatabaseType DBType = DatabaseType.MYSQL;
        protected int Total { get; set; }
        protected Dictionary<string, string> SortableColumns { get; set; }

        public Sortable(Dictionary<string, string> sortableColumns)
        {
            SortableColumns = sortableColumns;
        }

        public IEnumerable<T> Sort(DbSet<T> db, string query, FilterOptions options, List<string> fields)
        {
            query = BuildQuery(query, options, fields);

            if (fields.Count > 0)
            {
                return db.SqlQuery(query, fields.ToArray());
            }

            return db.SqlQuery(query);
        }


        public IEnumerable<T> SortCustom(DbContext context, string query, FilterOptions options, List<string> fields)
        {
            query = BuildQuery(query, options, fields);
            if (fields.Count > 0)
            {
                return context.Database.SqlQuery<T>(query, fields.ToArray());
            }

            return context.Database.SqlQuery<T>(query);
        }

        public string BuildQuery(string query, FilterOptions options, List<string> fields)
        {
            query += " ORDER BY ";

            var firstOrder = true;
            if (options.Order != null)
            {
                foreach (var sortColumn in options.Order)
                {
                    if (sortColumn.Field != null && SortableColumns.ContainsKey(sortColumn.Field))
                    {
                        if (firstOrder)
                            firstOrder = false;
                        else
                        {
                            query += ", ";
                        }

                        if (sortColumn.Type == "string")
                        {
                            query += SortableColumns[sortColumn.Field];
                        }
                        else if (sortColumn.Type == "date")
                        {
                            query += "CASE WHEN " + SortableColumns[sortColumn.Field] + " IS NULL THEN 1 ELSE 0 END";
                            if (sortColumn.Direction != 0) query += " DESC";
                            query += ", " + SortableColumns[sortColumn.Field];
                        }
                        else
                        {
                            query += SortableColumns[sortColumn.Field];
                        }

                        if (sortColumn.Direction == 0)
                        {
                            query += " ASC";
                        }
                        else
                        {
                            query += " DESC";
                        }
                    }
                }
            }

            if (firstOrder)
            {
                // Add default order.
                query += options.DefaultOrderColumn;
            }

            if (DBType == DatabaseType.MSSQL)
            {
                // Offset
                query += " OFFSET " + (options.Page * options.PageSize - options.PageSize) + " ROWS";

                // Fetch
                query += " FETCH NEXT " + options.PageSize + " ROWS ONLY";
            }
            else
            {
                if (options.Page == 0) options.Page = 1;
                // Offset
                query += " LIMIT " + (options.Page * options.PageSize - options.PageSize) + ", " + options.PageSize;
            }

            return query;
        }
    }
}