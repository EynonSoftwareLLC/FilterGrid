# FilterGrid

# Preview
A preview can be seen at http://filtergrid.eynon.software

# Overview
Filter Grid is an alternative open source tool for displaying tabular data pulled from a database in a useful way. FilterGrid was built specifically for applications using C# and Entity Framework Code First.

# Usage
- Add reference to Eynon.FilterGrid.
- Add FilterGrid.js and FilterGrid.css files.
- Create filtergrid table.
```
<div class="filtergrid-demo">
    <div class="filter-area">
        <button type="button" class="filter-apply" onclick="$('.filterable').trigger('loadFilters');">Reload List</button>
        <button type="button" class="filter-apply" onclick="$('.filterable').trigger('clearFilters');">Clear Filters</button>
        <div id="filter-area" class="filter-tray"></div>
        <div class="print-block"><span class="glyphicons glyphicons-print" onclick="$('.filterable').trigger('printGrid');"></span></div>
    </div>
    <div class="filterable saveable" data-route="/Home/GridResults" data-key="FIPS" data-load-immediate="true" data-filter-holder="filter-area" data-results="0" data-total="0" data-page="1" data-pageSize="5">
        <div class="pagination"></div>
        <table class="responsive-table">
            <thead>
                <tr>
                    <th data-filter="STATE" data-filter-type="string" data-show-filter="1" data-force-filter="1" data-sort="asc" data-sort-order="1">
                        State
                    </th>
                    <th data-filter="StateFP" data-filter-type="string">
                        State FP
                    </th>
                    <th data-filter="CountyFP" data-filter-type="string">
                        County FP
                    </th>
                    <th data-filter="County" data-filter-type="string" data-show-filter="1" data-sort="asc" data-sort-order="2">
                        County Name
                    </th>
                    <th data-filter="ClassFP" data-filter-type="string">
                        Class FP
                    </th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div class="pagination"></div>
    </div>
</div>
```
        
- Create filtergrid query.
```
[HttpPost]
public JsonResult GridResults(GridFilterModel model)
{

    var result = Filter(model.ToOptions());
    result.View = PartialToString("Partials/Index", result);
    return Json(result);
}

private GridResult Filter(FilterOptions options)
{
    var query = "SELECT * FROM FIPS";
    // Providing a separate count query is not required. However, it may greatly increase query performance.
    var countQuery = "SELECT count(1) FROM FIPS";
    options.DefaultOrderColumn = "FIPS.State";

    //  White List Columns
    var columns = new Dictionary
    {
        { "STATE", "FIPS.State" },
        { "StateFP", "FIPS.StateFP" },
        { "CountyFP", "FIPS.CountyFP" },
        { "County", "FIPS.CountyName" },
        { "ClassFP", "FIPS.CLASSFP" },
    };

    var table = new Filterable(columns);
    using (var db = new SampleDAL.Main())
    {
        //options.AdditionalFilters = new List() { "Suppliers.IsDeleted = 0" };
        var result = table.Filter(db, query, options, countQuery);
        return new GridResult(Mapper.Map>(result.Results), result.Page, result.TotalPages, result.Total, result.PageSize);
    }
}
```
    
- Create partial view.
```
@model Eynon.FilterGrid.GridResult<Eynon.Sample.Models.FIPS>

@foreach (var fips in Model.Results)
{
    <tr>
        <td>
            @fips.STATE
        </td>
        <td>
            @fips.STATEFP
        </td>
        <td>
            @fips.COUNTYFP
        </td>
        <td>
            @fips.COUNTYNAME
        </td>
        <td>
            @fips.CLASSFP
        </td>
    </tr>
}
```
    
# Dependencies
- Entity Framework 6
- MySQL or MSSQL
- Newtonsoft.JSON
- jQuery
- Bootstrap Glyphicons

# Options
```
Filterable attributes:

        data-count-holder
            [*] DOM ID of div containing filter boxes.
            Specifies where to put the count for a filtergrid.
            Ex: data-filter-holder="filter-count"

        data-filter-holder
            [*] DOM ID of div containing filter boxes.
            Specifies where to put the filter boxes for a filtergrid.
            Ex: data-filter-holder="filter-area"

        data-load-deferred
            [true]
            If data-load-immediate is set, and this is also set, the results will load after 200 milliseconds.

        data-filter-id
            [*] A unique ID identifying the specific filter grid on this page.
            This filter ID allows page caching to track which filter grid instance is being used. Prevents saved filters from applying to other filter
            grids on the same page.
            Ex: data-filter-id="main-filter"

        data-load-immediate
            [true]
            Determines if the grid results should be dynamically loaded immediately. Use this if the page load does not include data.
            Ex: data-load-immediate="true"

        data-page
            [0-9]+ Page shown at load time
            Specifies the page number that was displayed from the initial view.
            Ex: data-page="1"

        data-pages
            [0-9]+ Total pages available at load time
            Specifies the total pages that were available from the initial view.
            Ex: data-page="10"

        data-pagesize
            [0-9]+ Number of results per page
            Indicates the number of results per page.
            Ex: data-pagesize="25"

        data-refresh
            [0-9]+ Seconds to wait between refreshing
            When specified, the results will be refreshed every X seconds.
            Ex: data-refresh="30"

        data-results
            [0-9]+ Total results displayed at load time
            Specifies the number of results that were provided from the initial view.
            Ex: data-results="58"

        data-route
            [*] URL of grid results action
            The path to use for getting filter grid results.
            Ex: data-route="/Order/GridResults"

        data-selectable
            [true|false]
            Allows rows to be selected.
            Ex: data-selectable="true"

        data-summary
            [true|false]
            Enables the summary column.
            Ex: data-summary="true"

        data-title
            [*]
            Set's the title of the report for printing.

        data-total
            [0-9]+ Total results found at load time
            Specifies the number of results that were found from the initial view.
            Ex: data-total="1000+"

    Column Attributes:
        data-default-filter
            [*] JSON String
            Sets the default filter value.
            Ex: data-default-filter='{"Start":"11/07/2018","End":""}'

        data-disable-filter
            []
            Disables filtering of a column.
            Ex: data-disable-filter="true"

        data-disable-sort
            []
            Disables sorting of a column.
            Ex: data-disable-sort="true"

        data-dontclear
            []
            Prevents the filter from being cleared when using the clear all button.
            Ex: data-dontclear="true"

        data-filter
            [*] Filter Name
            Name of the filter to map to.
            Ex: data-filter="Order ID"

        data-hidden
            []
            Marks the column as hidden by default.
            Ex: data-hidden="true"

        data-filter-type
            [string|bool|date] Type of data
            The type of the filter
            Ex: data-filter-type="string"

        data-show-filter
            [1]
            Determines if a filter is shown by default.
            Ex: data-show-filter="1"

        data-sort
            [asc|desc] Sort Direction
            The default sort direction
            Ex: data-sort="asc"

        data-sort-order
            [0-9]+ Sort precedence
            Indicates the sort precedence.
            Ex: data-sort-order="1"
        

    Events
        Listeners:
            loadFilters
                Data: null
                When called, applies all filters and immediately gets results.

            initializeFilters
                Data: { Filter: [ { Field : "", Data : JSONSTRING ] }
                Used to initialize default filters. Note, this does not clear filters.

            clearFilters
                Data: null
                When called, filters will be cleared.

            setHiddenFilters
                Data: { filters : [ { Field : "", "Data" : {}, Type : "" ]}
                Sets the hidden filters to be applied.

            loadSavedFilter
                Data: { NewFilter: bool, Order: [ { Field:"", Direction:0|1, Type:"" } ], Filter: [ { Field:"", Data:JSONSTRING, Type:"" }], Page: 1, PageSize: 25 }; - Object sent from UpdateFilterable event.
                Loads the filters and orders specified.

            printGrid
                Data: {}
                Opens a printer friendly page.

            showHideColumns
                Data: {}
                Opens the show / hide columns modal for the filtergrid.

        Triggered:
            ApplyFilters
                Data: { NewFilter: bool, Order: [ { Field:"", Direction:0|1, Type:"" } ], Filter: [ { Field:"", Data:JSONSTRING, Type:"" }], HiddenColumns: [ 1 ] Page: 1, PageSize: 25 }; - Object sent from UpdateFilterable event.
                Called On: document, container
                Called when a new filter request starts.

            item-selected
                Data: undefined, parameter 1: row that was selected
                Called On: container
                Called when a row is selected in the filter grid.

            UpdateFilterable
                Called On: document, container
                Called when results have been updated.

            UpdateColumns
                Data: { NewFilter: bool, Order: [ { Field:"", Direction:0|1, Type:"" } ], Filter: [ { Field:"", Data:JSONSTRING, Type:"" }], HiddenColumns: [ 1 ] Page: 1, PageSize: 25 }; - Object sent from UpdateFilterable event.
                Called On: document, container
                Called when columns have been shown or hidden.

            updateResponsive
                Called On: window
                Called when results have been updated.
```
