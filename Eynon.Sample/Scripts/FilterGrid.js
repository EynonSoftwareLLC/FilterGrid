/*
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
            Ex: data-default-filter='{"Start":"@DateTime.UtcNow.AddDays(-30).ToString("MM/dd/yyyy")","End":""}'

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
            
*/

var com = com || {};
com.Eynon = com.Eynon || {};

com.Eynon.SessionMode = {
    // Filters will be saved on a per browser basis.
    Browser: 1,
    // Filters will be saved on a per window basis
    Window: 2
}

com.Eynon.FilterGrid = function (container) {
    var grid = this;
    this.container = container;
    this.filterWindows = {};
    this.activeFilterWindow = null;
    this.filterTray = null;
    this.activeFilters = {};
    this.activeSorts = [];
    this.selected = [];
    this.deferUpdate = false;
    this.newFilter = false;
    this.columnTitles = [];
    this.HiddenColumns = [];
    this.HiddenFilters = [];
    this.ColumnFilters = [];
    this.AdditionalFilters = [];
    this.SessionMode = com.Eynon.SessionMode.Browser;
    this.columnWindow = null;
    this.guid = null;

    this.route = "";
    this.pages = 1;
    this.page = 1;
    this.total = 0;
    this.pageSize = 25;
    this.refresh = null;
    this.refreshInterval = null;
    this.allowSelect = false;
    this.Summary = false;
    this.UpdateTimeout = null;
    this.ResultsLoaded = false;
    this.ActiveXHR = null;
    this.LoadImmediate = false;
    this.SettingsElement = null;
    this.FilterID = "";
    this.Initialized = false;

    this.DoCheckSavedState = null;

    // INITIALIZATION AND BINDING

    this.Initialize = function () {
        if (this.container.attr("data-filter-holder")) {
            this.filterTray = $("#" + this.container.attr("data-filter-holder"));
            this.filterTray.addClass("filter-tray");

            this.container.on("loadFilters", this.ApplyAllFilters);
            this.container.on("initializeFilters", this.LoadFilter);
            this.container.on("clearFilters", this.ClearFilters);
            this.container.on("setHiddenFilters", this.SetHiddenFilters);
            this.container.on("loadSavedFilter", this.SetFilters);
            this.container.on("printGrid", this.Print);
            this.container.on("showHideColumns", this.ShowHideColumns);
        }

        this.FilterID = this.container.attr("data-filter-id");
        this.pages = parseInt(this.container.attr("data-pages"));
        this.page = parseInt(this.container.attr("data-page"));
        this.route = this.container.attr("data-route");
        this.results = parseInt(this.container.attr("data-results"));
        this.total = parseInt(this.container.attr("data-total"));
        this.pageSize = parseInt(this.container.attr("data-pageSize"));
        this.refresh = parseInt(this.container.attr("data-refresh"));
        this.allowSelect = this.container.attr("data-selectable") == "true";
        this.Summary = this.container.attr("data-summary") == "true";
        this.countHolder = this.container.attr("data-count-holder");
        var settings = this.container.attr("data-settings-element");
        this.SettingsElement = (settings != undefined) ? $(settings) : null;
        var doCheckSaved = this.container.attr("data-check-saved-state");
        this.DoCheckSavedState = (doCheckSaved != undefined) ? doCheckSaved : "true";

        this.BuildPagination(this.results, this.page, this.pages, this.total);

        this.Bind();

        if (!isNaN(this.refresh)) {
            this.refreshInterval = setTimeout(this.UpdateResults, this.refresh * 1000);
        }

        // Init default filters.
        this.LoadDefaultFilters();
        this.LoadDefaultSorts();

        if (this.DoCheckSavedState == "true") {
            this.CheckSavedState();
        }

        if (this.container.attr("data-load-immediate") == "true") {
            this.LoadImmediate = true;
            if (this.container.attr("data-load-deferred") == "true") {
                var ctxt = this;
                setTimeout(function () { ctxt.UpdateResults(); }, 200);
            }
            else {
                this.UpdateResults();
            }
        }

        this.Initialized = true;

        //if (this.SettingsElement != null) this.HideOptions();
    }

    this.Bind = function () {
        this.container.on("refreshGrid", this.RefreshResults);
        this.container.find("th").each(function () {
            var filter = $(this).attr("data-filter");
            if (typeof filter !== typeof undefined && filter !== false) {
                grid.BindFilter($(this));
            }
        });

        this.container.find(".additional-filter").each(function () {
            var additionalFilter = {
                Field: $(this).attr("data-filter"),
                Display: $(this).attr("data-filter-name"),
                Data: "",
                Type: $(this).attr("data-filter-type"),
                Container: $(this)
            };

            grid.AdditionalFilters.push(additionalFilter);

            if ($(this).attr("data-filter-show") && JSON.parse($(this).attr("data-filter-show"))) {
                grid.ShowAdditionalFilterWindow(additionalFilter.Container, additionalFilter.Display, additionalFilter.Field, additionalFilter.Type);
            }
        });

        grid.BuildAdditionalFilterSelect();
        this.BindRows();
    }

    this.GetSavedStateName = function () {
        return grid.FilterID + ":" + grid.route;
    }

    this.CheckSavedState = function () {
        com.Eynon.SessionMode
        var state = (grid.SessionMode == com.Eynon.SessionMode.Browser) ? window.localStorage.getItem(grid.GetSavedStateName()) : window.sessionStorage.getItem(grid.GetSavedStateName());
        if (state) {
            // Load it.
            var state = JSON.parse(state);
            state.Data.SetPage = state.Data.Page;
            grid.container.trigger("loadSavedFilter", state);
        }
    }

    this.CreateState = function (state) {
        if (grid.SessionMode == com.Eynon.SessionMode.Browser) {
            window.localStorage.setItem(grid.GetSavedStateName(), JSON.stringify(state));
        }
        else {
            window.sessionStorage.setItem(grid.GetSavedStateName(), JSON.stringify(state));
        }
    }

    this.GenerateGUID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    this.BindRows = function () {
        this.container.find("tbody > tr").each(function () {
            $(this).on("click", function () {
                grid.container.trigger("item-selected", this);
            });
        });
    }

    /*
        Additional Filters require a filter tray.
    */
    this.BuildAdditionalFilterSelect = function () {

        if (grid.filterTray == null) return;

        var container = $("<div></div>").addClass("additional-filter-select");
        var select = $("<select></select>").appendTo(container);
        select.append($("<option value=\"0\">- Add Filter -</option>"));

        for (var i in grid.AdditionalFilters) {
            $("<option></option>").text(grid.AdditionalFilters[i].Field).appendTo(select);
        }

        for (var i in grid.ColumnFilters) {
            $("<option></option>").text(grid.ColumnFilters[i].Field).appendTo(select);
        }

        container.insertBefore(grid.filterTray);

        select.on("change", grid.AddSelectFilter);
    }

    this.GetAdditionalFilter = function (field) {
        for (var i in grid.AdditionalFilters) {
            if (grid.AdditionalFilters[i].Field == field) return grid.AdditionalFilters[i];
        }
        return null;
    }

    this.GetColumnFilter = function (field) {
        for (var i in grid.ColumnFilters) {
            if (grid.ColumnFilters[i].Field == field) return grid.ColumnFilters[i];
        }
        return null;
    }

    this.AddSelectFilter = function (e) {
        var select = $(this);
        var selectedOption = select.val();
        select.val(0);

        // If filter is an additional filter
        var additional = grid.GetAdditionalFilter(selectedOption);
        if (additional != null) {
            grid.ShowAdditionalFilterWindow(additional.Container, additional.Display, additional.Field, additional.Type); //
        }
        else {
            var filter = grid.GetColumnFilter(selectedOption);
            grid.ShowFilterWindow(filter.Container);
        }
    }

    this.BindFilter = function (th) {
        // Add filter icon.
        var header = th.html();
        var newObj = $("<div></div>").append(header);
        //th.append($("<span></span>").addClass("glyphicon glyphicon-sort"));
        th.empty().append(newObj);

        var sortable = true;
        if (th.attr("data-disable-sort")) sortable = false;
        if (sortable) {
            var sort = $("<span></span>").addClass("glyphicon glyphicon-sort");
            var sortIndex = $("<span></span>").addClass("sort-number");
            newObj.append(sortIndex);
            newObj.append(sort);
            sort.on("click", this.ApplySort);
        }

        var filterable = true;
        if (th.attr("data-disable-filter")) filterable = false;

        if (filterable) {
            var filter = $("<span></span>").addClass("glyphicon glyphicon-filter");
            newObj.append(filter);
            // Bind actions.
            filter.on("click", this.OpenFilterWindow);
            var columnFilter = {
                Field: th.attr("data-filter"),
                Display: th.attr("data-filter"),
                Data: "",
                Type: th.attr("data-type"),
                Container: filter
            };

            grid.ColumnFilters.push(columnFilter);
        }

    }

    // RESULT HANDLING

    this.RefreshResults = function () {
        grid.UpdateResults();
    }

    this.GetData = function () {
        var filters = [];
        filters = filters.concat(this.GetVisibleFilters());
        filters = filters.concat(this.GetHiddenFilters());
        return grid.BuildData(filters);
    }

    this.BuildData = function (filters) {
        var data = {
            NewFilter: grid.newFilter,
            Order: grid.activeSorts,
            Filter: filters,
            Page: grid.page,
            PageSize: grid.pageSize,
            HiddenColumns: grid.HiddenColumns
        };

        return data;
    }

    this.GetVisibleFilters = function () {
        var filters = [];

        for (var i in grid.activeFilters) {
            filters.push({
                Field: i,
                Data: JSON.stringify(grid.activeFilters[i].Data),
                Type: grid.activeFilters[i].Type
            });
        }

        return filters;
    }

    this.GetHiddenFilters = function () {
        var filters = [];
        for (var i in grid.HiddenFilters) {
            filters.push({
                Field: grid.HiddenFilters[i].Field,
                Data: JSON.stringify(grid.HiddenFilters[i].Data),
                Type: grid.HiddenFilters[i].Type,
            });
        }
        return filters;
    }

    this.GetStateData = function () {
        var filters = [];
        filters = filters.concat(this.GetVisibleFilters());
        return grid.BuildData(filters);
    }

    this.UpdateResults = function () {
        var data = grid.GetData();
        grid.CreateState({ Data: grid.GetStateData() });
        grid.container.trigger("ApplyFilters", { Data: data });

        grid.container.find(".pagination .glyphicon-refresh").addClass("spinner");
        grid.container.find(".pagination .status-text").text("Loading...");

        clearTimeout(grid.refreshInterval);

        if (grid.ActiveXHR != null) grid.ActiveXHR.abort();
        if (grid.total == 0) {
            grid.container.find("td[colspan]").text("Refreshing results...");
        }
        grid.route = grid.container.attr("data-route");
        grid.ActiveXHR = $.post(grid.route, data, function (data) {
            if (data.View != null) {
                grid.container.find("tbody").html(data.View);
            }

            if (data.Count != undefined && data.Page != undefined && data.Total != undefined && data.Pages != undefined) {
                grid.ResultsLoaded = true;
                grid.page = data.Page;
                grid.pages = data.Pages;
                grid.total = data.Total;
                grid.BuildPagination(data.Count, data.Page, data.Pages, data.Total);

                if (grid.Summary) {
                    var row = $("<tr></tr>").addClass("summary");
                    for (var i in grid.columnTitles) {
                        var td = $("<td></td>");
                        if (data.Summary != null && data.Summary[grid.columnTitles[i]] != null) {
                            td.text(data.Summary[grid.columnTitles[i]]);
                        }
                        row.append(td);
                    }
                    grid.container.find("tbody").append(row);
                }

                // Rerun select2 on results.
                //grid.container.find(".select2-full").select2({ width: "100%" });
            }

            grid.BindRows();
            $(document).trigger("UpdateFiltertable", grid.container);
            grid.container.trigger("UpdateFiltertable");
            $(window).trigger("updateResponsive");

            // Assign data-title attribute for each 
            grid.container.find("tbody td").each(function () {
                var index = $(this).index();
                if (index == 0) $(this).addClass("rowheader");
                else {
                    if (grid.columnTitles[index].length > 0)
                        $(this).prepend($("<div><.div>").addClass("mobile-title").text(grid.columnTitles[index]));
                }
            });
        }).always(function () {
            grid.newFilter = false;
            clearTimeout(grid.refreshInterval);
            if (!isNaN(grid.refresh)) {
                grid.refreshInterval = setTimeout(grid.UpdateResults, grid.refresh * 1000);
            }
        });
    }

    this.Print = function () {
        var gridData = grid.GetData();
        gridData.PageSize = 500000;
        var w = window.open("/Print");
        var loaded = false;
        $(w).on("load", function () {
            loaded = true;
        });
        var hiddenClass = "";
        for (var i = 0; i < grid.HiddenColumns.length; i++) {
            hiddenClass += "hide-column-" + (grid.HiddenColumns[i] + 1) + " ";
        }
        $.post(grid.route, gridData, function (data) {
            if (data.View != null) {
                var name = document.title;
                name = grid.container.attr("data-title") || name;
                var report = $("<h1></h1>").text(name);
                var resultTable = grid.container.find("table").clone();
                resultTable.find("tbody").html(data.View);
                resultTable.find(".glyphicon,.sort-number").remove();
                resultTable.find('a').contents().unwrap();

                if (grid.Summary) {
                    var row = $("<tr></tr>").addClass("summary");
                    for (var i in grid.columnTitles) {
                        var td = $("<td></td>");
                        if (data.Summary != null && data.Summary[grid.columnTitles[i]] != null) {
                            td.text(data.Summary[grid.columnTitles[i]]);
                        }
                        row.append(td);
                    }
                    resultTable.find("tbody").append(row);
                }

                var removeIndexes = [];
                // Remove empty column.
                resultTable.find("th").each(function () {
                    if ($(this).attr("data-filter") == undefined) {
                        removeIndexes.push($(this).index());
                    }
                });

                removeIndexes.sort().reverse();

                for (var i = 0; i < removeIndexes.length; i++) {
                    resultTable.find("th:nth-child(" + (removeIndexes[i] + 1) + ")").remove();
                }

                var filters = $("<div class=\"filters\"></div>");
                if (gridData.Filter.length > 0) filters.append("Filters: ");
                for (var i in gridData.Filter) {
                    var f = gridData.Filter[i];
                    filters.append("<div class=\"filter\"><span>" + f.Field + ":</span> " + f.Data + "</div>");
                }

                w.document.title = name;
                if (loaded) {
                    $(w.document.body).addClass(hiddenClass);
                    $(w.document.body).append(report).append(filters).append(resultTable);
                }
                else {
                    $(w).on("load", function () {
                        $(w.document.body).addClass(hiddenClass);
                        $(w.document.body).append(report).append(filters).append(resultTable);
                    });
                }
            }

        });
    }

    // PAGINATION

    this.BuildPagination = function (results, page, pages, total) {
        if (isNaN(total)) total = 0;
        if (total == 1000) total = "1000+";
        var text = $("<span>Displaying <strong>" + results + "</strong> of <strong>" + total + "</strong> results.</span>");
        var pagesection = $("<div></div>").addClass("pages");

        if (page > 1) {
            pagesection.append($("<span class=\"glyphicon glyphicon-step-backward\"></span>").on("click", grid.pageLeftMost));

            pagesection.append($("<span class=\"glyphicon glyphicon-arrow-left\"></span>").on("click", grid.pageLeft));

        }

        if (pages > 1) {
            for (var i = ((page - 10 < 1) ? 1 : page - 10); i < page; i++) {
                pagesection.append($("<span class=\"page\">" + i + "</span>").on("click", { page: i }, grid.setPage));
            }

            pagesection.append($("<input />").attr({
                type: "number",
                min: 1,
                max: pages.length,
                value: i,
            }).addClass("page active").on("keyup", function (e) {
                var val = $(this).val();
                setTimeout(function () {
                    e = {
                        data: {
                            page: val,
                        },
                    };
                    grid.setPage(e);
                }, 500);
            }));

            for (var i = page + 1; i <= pages && i < page + 10; i++) {
                pagesection.append($("<span class=\"page\">" + i + "</span>").on("click", { page: i }, grid.setPage));
            }

            pagesection.append($("<span class=\"glyphicon glyphicon-arrow-right\"></span>").on("click", grid.pageRight));

            pagesection.append($("<span class=\"glyphicon glyphicon-step-forward\"></span>").on("click", grid.pageRightMost));
        }

        var status = $("<div></div>").addClass("status");
        status.append($("<span>Ready.</span>").addClass("status-text"));
        status.append($("<span></span>").addClass("glyphicon glyphicon-refresh").on("click", grid.UpdateResults));
        if (grid.SettingsElement != null)
            status.append($("<span></span>").addClass("glyphicon glyphicon-option-horizontal").on("click", grid.ToggleOptions));

        grid.container.find(".pagination").empty().append(text).append(pagesection).append(status);
        if (grid.countHolder != null && grid.ResultsLoaded) {
            $("#" + grid.countHolder).text(total);
        }
        
    }

    this.ToggleOptions = function () {
        if (grid.SettingsElement != null) {
            if (!grid.SettingsElement.hasClass("hidden")) {
                grid.SettingsElement.addClass("hidden");
            }
            else {
                grid.SettingsElement.removeClass("hidden");
            }
        }
    }

    this.HideOptions = function () {
        if (grid.SettingsElement != null) {
            grid.SettingsElement.addClass("hidden");
        }
    }

    this.ShowOptions = function () {
        if (grid.SettingsElement != null) {
            grid.SettingsElement.removeClass("hidden");
        }
    }

    this.ShowOptions = function () {
        if (grid.SettingsElement != null) {
            grid.SettingsElement.removeClass("hidden");
        }
    }

    this.pageLeft = function () {
        grid.page -= 1;
        if (grid.page < 1) grid.page = 1;

        grid.UpdateResults();
    }

    this.pageRight = function () {
        grid.page += 1;
        if (grid.page > grid.pages) grid.page = grid.pages;

        grid.UpdateResults();
    }

    this.pageLeftMost = function () {
        grid.page = 1;

        grid.UpdateResults();
    }

    this.pageRightMost = function () {
        grid.page = grid.pages;

        grid.UpdateResults();
    }

    this.setPage = function (e) {
        grid.page = e.data.page;
        if (grid.page > grid.pages) grid.page = grid.pages;
        if (grid.page < 1) grid.page = 1;

        grid.UpdateResults();
    }

    // CUSTOMIZATION
    this.ShowAllColumns = function () {
        for (var i = 0; i < grid.columnTitles.length; i++) {
            grid.ShowColumn(i);
        }
    }

    this.ShowHideColumns = function () {
        // Get all columns.
        var columns = grid.columnTitles;
        var columnMap = [];
        for (var i = 0; i < columns.length; i++) {
            if (!grid.StringEmpty(columns[i])) {
                columnMap.push({
                    title: columns[i],
                    index: i,
                    enabled: !grid.IsHiddenColumn(i)
                });
            }
        }

        // Build Show / Hide Window
        var window = grid.BuildShowHideWindow(columnMap);
        window.modal('show');
    }

    this.StringEmpty = function (string) {
        return string == null || (string.length === 0 || !string.trim());
    }

    this.IsHiddenColumn = function (index) {
        for (var i = 0; i < grid.HiddenColumns.length; i++) {
            if (grid.HiddenColumns[i] == index) return true;
        }

        return false;
    }

    this.HideColumn = function (index) {
        if (!grid.IsHiddenColumn(index)) {
            grid.HiddenColumns.push(index);
        }

        grid.container.addClass("hide-column-" + (index + 1));
    }

    this.ShowColumn = function (index) {
        grid.container.removeClass("hide-column-" + (index + 1));
        for (var i = 0; i < grid.HiddenColumns.length; i++) {
            if (grid.HiddenColumns[i] == index) {
                grid.HiddenColumns.splice(i, 1);
                return;
            }
        }
    }

    this.BuildShowHideWindow = function (columns) {
        if (grid.columnWindow == null) {
            // Make a new one.
            grid.columnWindow = $("<div class=\"showHide-window modal fade\" tabindex=\"-1\" role=\"dialog\"></div>");
            grid.columnWindow.append($("<div class=\"modal-dialog\" role=\"document\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Show / Hide Columns</h4></div><div class=\"modal-body\"></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button></div></div></div>"));
        }

        var container = $("<div></div>").addClass("column-select");
        for (var i in columns) {
            var col = columns[i];
            var app = $("<div></div>").addClass("column-select-column").text(col.title);
            if (columns[i].enabled) app.addClass("column-enabled");
            app.on("click", col, grid.toggleColumn);
            container.append(app);
        }

        grid.columnWindow.find(".modal-body").empty().append(container);

        return grid.columnWindow;
    }

    this.toggleColumn = function (e, d) {
        if (grid.IsHiddenColumn(e.data.index)) {
            grid.ShowColumn(e.data.index);
        }
        else {
            grid.HideColumn(e.data.index);
        }

        grid.ShowHideColumns();

        var data = grid.GetData();
        grid.container.trigger("UpdateColumns", { Data: data });
        grid.CreateState({ Data: data });
    }

    // SORTING

    this.LoadDefaultSorts = function () {
        var sorts = [];
        this.container.find("th").each(function () {
            var filter = $(this).attr("data-filter");
            if (typeof filter !== typeof undefined && filter !== false) {
                var sort = $(this).attr("data-sort");
                var sortOrder = $(this).attr("data-sort-order") || "asc";
                if (sort != undefined && sortOrder != undefined)
                    sorts.push({ row: $(this), order: sortOrder, dir: sort });
            }
        });

        sorts.sort(function (a, b) {
            return ((a.order > b.order) ? -1 : ((a.order < b.order) ? 1 : 0));
        });

        for (var i in sorts) {
            var btn = sorts[i].row.find(".glyphicon-sort");
            var field = sorts[i].row.attr("data-filter");
            var type = sorts[i].row.attr("data-filter-type");
            if (sorts[i].dir == "desc") this.SortDesc(btn, field, type);
            else this.SortAsc(btn, field, type);
        }

        grid.UpdateSortNumbers();
        if (grid.LoadImmediate)
            grid.UpdateResults();
    }

    this.ClearSort = function () {
        this.container.find("th").each(function () {
            var btn = $(this).find(".glyphicon-sort, .glyphicon-sort-by-attributes, .glyphicon-sort-by-attributes-alt");
            btn.removeClass("glyphicon-sort-by-attributes").removeClass("glyphicon-sort-by-attributes-alt").removeClass("active-filter").addClass("glyphicon-sort")
            $(this).find(".sort-number").html("");
        });
        this.activeSorts = [];
        grid.UpdateSortNumbers();
    }

    this.ApplySort = function () {
        var btn = $(this);
        var field = $(btn).parent().parent().attr("data-filter");
        var type = $(btn).parent().parent().attr("data-filter-type");

        var sort = grid.AddSort(field, type);
        if (sort == null) {
            btn.removeClass("glyphicon-sort-by-attributes").removeClass("glyphicon-sort-by-attributes-alt").removeClass("active-filter").addClass("glyphicon-sort");
        }
        else {
            if (sort == 0) {
                btn.addClass("glyphicon-sort-by-attributes").removeClass("glyphicon-sort-by-attributes-alt").removeClass("glyphicon-sort").addClass("active-filter");
            }
            else {
                btn.removeClass("glyphicon-sort-by-attributes").addClass("glyphicon-sort-by-attributes-alt").removeClass("glyphicon-sort").addClass("active-filter");
            }

            var index = grid.GetSortIndex(field);
        }
        grid.UpdateSortNumbers();

        grid.UpdateResults();
    }

    this.SortAsc = function (btn, field, type) {
        var sort = grid.AddSortAsc(field, type);
        btn.removeClass("glyphicon-sort-by-attributes-alt").addClass("active-filter").removeClass("glyphicon-sort").addClass("glyphicon-sort-by-attributes");
    }

    this.SortDesc = function (btn, field, type) {
        var sort = grid.AddSortDesc(field, type);
        btn.removeClass("glyphicon-sort-by-attributes").addClass("glyphicon-sort-by-attributes-alt").addClass("active-filter").removeClass("glyphicon-sort");
    }

    this.UpdateSortNumbers = function () {
        this.container.find("th").each(function () {
            var filter = $(this).attr("data-filter");
            if (typeof filter !== typeof undefined && filter !== false) {
                grid.UpdateSortNumber($(this), filter);
            }
        });
    }

    this.UpdateSortNumber = function (col, field) {
        var index = grid.GetSortIndex(field);
        if (index == null) {
            col.find(".sort-number").text("");
        }
        else {
            col.find(".sort-number").text(index + 1);
        }
    }

    this.LogSort = function () {
        for (var i = 0; i < this.activeSorts.length; i++) {
            console.log(this.activeSorts[i]);
        }
    }

    this.AddSort = function (field, type) {
        var current = this.GetSortIndex(field);
        if (current == null) {
            // Add new one.
            this.activeSorts.unshift({ Field: field, Direction: 0, Type: type });
            return 0;
        }
        else {
            var sort = this.activeSorts[current];
            if (sort.Direction == 1) {
                // Remove it.
                this.activeSorts.splice(current, 1);
                return null;
            }
            else {
                this.activeSorts[current].Direction = 1;
                return 1;
            }
        }
    }

    this.AddSortAsc = function (field, type) {
        var current = this.GetSortIndex(field);
        if (current == null) {
            // Add new one.
            this.activeSorts.unshift({ Field: field, Direction: 0, Type: type });
            return 0;
        }
        else {
            this.activeSorts[current].Direction = 0;
            return 1;
        }
    }

    this.AddSortDesc = function (field, type) {
        var current = this.GetSortIndex(field);
        if (current == null) {
            // Add new one.
            this.activeSorts.unshift({ Field: field, Direction: 1, Type: type });
        }
        else {
            this.activeSorts[current].Direction = 1;
        }
    }

    this.GetSort = function (field) {
        var index = this.GetSortIndex(field);
        if (index == null) return null;
        return this.activeSorts[index];
    }

    this.GetSortIndex = function (field) {
        for (var i = 0; i < this.activeSorts.length; i++) {
            if (this.activeSorts[i].Field == field) {
                return i;
            }
        }

        return null;
    }


    // FILTERING
    this.LoadFilter = function (e, data) {
        if (data == null || data.Filter == null) return;
        grid.container.find("th").each(function () {
            var col = $(this).attr("data-filter");
            if (data.Filter != null && data.Filter.length > 0) {
                for (var i in data.Filter) {
                    if (col == data.Filter[i].Field) {

                        var type = $(this).attr("data-filter-type");
                        grid.SetFilter(col, JSON.parse(data.Filter[i].Data), type);
                        if (grid.filterTray != null) {
                            $(this).find(".glyphicon-filter").trigger("click").addClass("active-filter");
                        }
                    }
                }
            }
        });
    }

    this.RemoveAllFilters = function () {
        grid.container.find("th").each(function () {
            var filter = $(this).attr("data-filter");
            if (typeof filter !== typeof undefined && filter !== false) {
                if (!$(this).attr("data-dontclear")) {
                    grid.HideFilter(filter);
                    delete grid.activeFilters[filter];
                }
            }
        });

        // Load default filters.
        grid.LoadDefaultFilters();

        for (var i in grid.AdditionalFilters) {
            if (!grid.AdditionalFilters[i].Container.attr("data-dontclear")) {
                grid.HideFilter(grid.AdditionalFilters[i].Field);
                delete grid.activeFilters[grid.AdditionalFilters[i].Field];
            }
        }

        grid.ClearFilters();

    }

    this.ClearFilters = function () {
        grid.container.find("th").each(function () {
            var filter = $(this).attr("data-filter");
            if (typeof filter !== typeof undefined && filter !== false) {
                if (!$(this).attr("data-dontclear")) {
                    grid.ClearFilterValue(filter);
                }
            }
        });

        for (var i in grid.AdditionalFilters) {
            if (!grid.AdditionalFilters[i].Container.attr("data-dontclear")) {
                grid.ClearFilterValue(grid.AdditionalFilters[i].Field);
            }
        }

        grid.ClearSort();
        grid.LoadDefaultSorts();
        grid.container.trigger("loadFilters");
    }

    this.LoadDefaultFilters = function () {
        var initialized = grid.columnTitles.length != 0;
        this.container.find("th").each(function () {
            if (!initialized) {
                grid.columnTitles.push($(this).find("div").clone().children().remove().end().text().trim());
                var hidden = $(this).attr("data-hidden");
                if (typeof hidden !== typeof undefined && hidden !== false) {
                    grid.HideColumn(grid.columnTitles.length - 1);
                }
            }
            var filter = $(this).attr("data-filter");
            if (typeof filter !== typeof undefined && filter !== false) {
                var type = $(this).attr("data-filter-type");
                if ($(this).attr("data-default-filter")) {
                    var defaultData = $(this).attr("data-default-filter");
                    try {
                        defaultData = JSON.parse(defaultData);
                    }
                    catch (exception) { }

                    grid.SetFilter(filter, defaultData, type);
                    if (grid.filterTray != null) {
                        $(this).find(".glyphicon-filter").trigger("click").addClass("active-filter");
                    }
                }
                else if ($(this).attr("data-show-filter")) {
                    if (grid.filterTray != null) {
                        $(this).find(".glyphicon-filter").trigger("click");
                    }
                }
            }
        });
    }

    this.SetFilters = function (e, data) {
        grid.ImportFilterData(data.Data);
    }

    this.ImportFilterData = function (data) {
        grid.RemoveAllFilters();
        for (var i in data.Filter) {
            var f = data.Filter[i];
            var th = grid.container.find("th[data-filter='" + f.Field + "']");
            var defaultData = f.Data;
            try {
                defaultData = JSON.parse(f.Data);
            }
            catch (exception) { }
            grid.SetFilter(f.Field, defaultData, f.Type);

            var filter = grid.GetAdditionalFilter(f.Field);
            if (filter != null) {
                grid.ShowAdditionalFilterWindow(filter.Container, filter.Display, filter.Field, filter.Type);
            }

            if (grid.filterTray != null) {
                th.find(".glyphicon-filter").trigger("click").addClass("active-filter");
            }
        }

        var order = data.Order.reverse();
        grid.ClearSort();
        for (var i in order) {
            var o = order[i];
            var th = grid.container.find("th[data-filter='" + o.Field + "']");
            var btn = th.find(".glyphicon-sort");
            var field = th.attr("data-filter");
            var type = th.attr("data-filter-type");
            if (o.Direction == 1) grid.SortDesc(btn, field, type);
            else grid.SortAsc(btn, field, type);
        }

        grid.ShowAllColumns();
        grid.HiddenColumns = [];
        for (var i in data.HiddenColumns) {
            grid.HideColumn(data.HiddenColumns[i]);
        }

        grid.UpdateSortNumbers();

        if (data.SetPage) {
            grid.page = data.SetPage;
        }
        grid.UpdateResults();


    }

    this.SetHiddenFilters = function (e, data) {
        grid.ApplyHiddenFilters(data.filters);
    }

    this.ApplyHiddenFilters = function (filters) {
        if (!Array.isArray(filters)) {
            filters = [filters];
        }

        grid.HiddenFilters = filters;
        grid.UpdateResults();
    }

    this.BuildFilterWindow = function (column, field, datatype) {
        var filterWindow = null;
        if (this.filterWindows[field] == null) {
            // Make a new one.
            this.filterWindows[field] = $("<div></div>").addClass("filter-window");
            this.filterWindows[field].data("column", column).data("window", this.filterWindows[field]).data("field", field).data("type", datatype)
        }
        filterWindow = this.filterWindows[field];

        filterWindow.empty().removeClass("hide");
        var header = $("<div>" + column.find("div").clone().children().remove().end().text() + "</div>").addClass("filter-header");

        if (grid.filterTray == null) {
            header.append($("<span class=\"glyphicon glyphicon-remove\"></span>").on("click", function () {
                $(this).parent().parent().addClass("hide");
            }));
        }

        filterWindow.append(header);
        if (grid.filterTray == null)
            filterWindow.append($("<div></div>").addClass("clearfix"));

        switch (datatype) {
            case "string":
                this.BuildStringFilter(field, filterWindow);
                break;
            case "bool":
                this.BuildBoolFilter(field, filterWindow);
                break;
            case "date":
                this.BuildDateFilter(field, filterWindow);
                break;
            case "list":
                this.BuildListFilter(column, field, filterWindow);
        }

        var footer = $("<div></div>").addClass("filter-footer");
        if (grid.filterTray == null) {
            footer.append($("<button type=\"button\">Apply</button>").on("click", { column: column, window: filterWindow, field: field, type: datatype }, grid.ApplyFilter));
            if (!column.attr("data-force-filter"))
                footer.append($("<button type=\"button\">Clear</button>").on("click", { column: column, window: filterWindow, field: field, type: datatype }, grid.ClearFilter));
        }
        else {
            //footer.append($("<button type=\"button\"><span class=\"glyphicon glyphicon-tick\"></span></button>").on("click", { column: column, window: filterWindow, field: field, type: datatype }, grid.ApplyFilter));
            if (!column.attr("data-force-filter"))
                footer.append($("<button type=\"button\"><span class=\"glyphicon glyphicon-remove\"></span></button>").on("click", { column: column, window: filterWindow, field: field, type: datatype }, grid.ClearFilter));
        }
        filterWindow.append(footer);

        return filterWindow;
    }

    this.BuildListFilter = function (column, field, filterWindow) {
        var items = column.data("filter-items");
        var data = this.GetFilter(field);

        if (data == null) {
            data = "";
        }

        var select = $("<select></select>").addClass("filterable-focusable"); //.prop("multiple", "multiple");
        select.append($("<option></option>").prop("value", "").text("All"));
        for (var i in items) {
            select.append($("<option></option>").prop("value", items[i].Value).text(items[i].Text));
        }

        filterWindow.append(select.val(data.Data).addClass("contains").attr("placeholder", "Contains"));
        //select.select2({ width: 250 });
        select.on("change", function () {
            grid.container.trigger("loadFilters");
        });
    }

    this.BuildStringFilter = function (field, filterWindow) {
        var data = this.GetFilter(field);

        if (data == null) {
            data = "";
        }

        filterWindow.append($("<input type=\"text\" />").val(data.Data).addClass("contains").addClass("filterable-focusable").attr("placeholder", "Contains").on("keyup", function (e) {
            if (grid.UpdateTimeout != null) clearTimeout(grid.UpdateTimeout);
            var g = grid;
            if (e.keyCode === 13) {
                g.container.trigger("loadFilters");
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
            else {
                grid.UpdateTimeout = setTimeout(function () {
                    g.container.trigger("loadFilters");
                }, 800);
            }
            /*if (e.keyCode == 13) {
                grid.container.trigger("loadFilters");
            }*/
        }).on("keypress", function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }));
    }

    this.BuildBoolFilter = function (field, filterWindow) {
        var data = this.GetFilter(field);

        var select = $("<select></select>").addClass("boolFilter").addClass("filterable-focusable");
        var yes = $("<option value=\"1\">Yes</option>");
        var no = $("<option value=\"0\">No</option>");
        if (data != null && data.Data == 0) no.attr("selected", "1");
        else yes.attr("selected", "1");
        select.append(yes);
        select.append(no);

        filterWindow.append(select);
        select.on("change", function () {
            grid.container.trigger("loadFilters");
        });
    }

    this.GetDateRanges = function () {
        return {
            'Today': [moment().startOf('day'), moment().add(1, 'days').startOf('day')],
            'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().startOf('day')],
            'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().startOf('day')],
            'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().startOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        };
    }

    this.GetDateRangeValue = function (value) {
        if (value == null || value == "") return [null, null];
        var dates = grid.GetDateRanges();
        for (var i in dates) {
            if (value == i) {
                return dates[i];
            }
        }

        // Parse custom date range.
        var range = value.split(' - ');
        return [moment(range[0]), moment(range[1])];

    }

    this.GetDateRangeText = function (value) {
        if (value == null || value == "") return "";
        var dates = grid.GetDateRanges();
        for (var i in dates) {
            if (value == i) {
                return i;
            }
        }

        // Parse custom date range.
        return value;
    }

    this.BuildDateFilter = function (field, filterWindow) {
        var data = this.GetFilter(field);

        if (data == null) {
            data = { Data: { Start: "", End: "", Name: "" } };
        }
        var dateRange = $("<div></div>").addClass("input-group");
        var dateRangeVal = grid.GetDateRangeValue(data.Name);
        dateRange.append($("<input type=\"text\" />").addClass("filterable-focusable").val(grid.GetDateRangeText(data.Data.Name)).addClass("starts fg-datepicker").attr("placeholder", "Date range"));
        filterWindow.append(dateRange);
        dateRange.daterangepicker({
            startDate: dateRangeVal[0] || moment(),
            endDate: dateRangeVal[1] || moment(),
            timePicker: true,
            ranges: grid.GetDateRanges()
        },
            function (start, end, e) {
                var text = "";
                if (e == "Custom Range") {
                    text = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
                }
                else {
                    text = e;
                }
                dateRange.find(".starts").val(text);
                grid.container.trigger("loadFilters");
            });
        dateRange.find(".starts").change(function () { grid.container.trigger("loadFilters"); });
    }

    this.SetStringFilter = function (field, filterWindow) {
        this.SetFilter(field, filterWindow.find("input.contains").val(), "string");
    }

    this.GetStringFilter = function (field, filterWindow) {
        return filterWindow.find("input.contains").val().trim();
    }

    this.SetBoolFilter = function (field, filterWindow) {
        this.SetFilter(field, filterWindow.find("select").val(), "bool");
    }

    this.GetBoolFilter = function (field, filterWindow) {
        return filterWindow.find("select").val();
    }

    this.SetDateFilter = function (field, filterWindow) {
        this.SetFilter(field, grid.GetDateFilter(field, filterWindow), "date");
    }

    this.GetDateFilter = function (field, filterWindow) {
        var text = filterWindow.find(".starts").val();
        var val = grid.GetDateRangeValue(text);
        if (val[0] == null || val[1] == null)
            return { Start: "", End: "", Name: text };
        return { Start: val[0].format('YYYY-MM-DDTHH:mm:ss'), End: val[1].format('YYYY-MM-DDTHH:mm:ss'), Name: text };
        //return { Start: filterWindow.find(".starts").val(), End: filterWindow.find(".ends").val() };
    }

    this.SetListFilter = function (field, filterWindow) {
        if (filterWindow.find("select").val() == "")
            this.SetFilter(field, null, "list");
        else
            this.SetFilter(field, [filterWindow.find("select").val()], "list");
    }

    this.GetListFilter = function (field, filterWindow) {
        if (filterWindow.find("select").val() == null) return "";
        return [filterWindow.find("select").val()];
    }

    this.OpenFilterWindow = function () {
        var btn = $(this);
        grid.ShowFilterWindow(btn);
    }

    this.ShowFilterWindow = function (btn) {
        grid.ShowOptions();
        var field = $(btn).parent().parent().attr("data-filter");
        var type = $(btn).parent().parent().attr("data-filter-type");
        if (grid.filterTray == null && grid.filterWindows[field] && !grid.filterWindows[field].hasClass("hide")) {
            grid.HideFilter(field);
        }
        else {
            if (grid.filterTray == null) {
                // Hide All Filter Windows
                for (var i in grid.filterWindows) {
                    grid.HideFilter(i);
                }
            }
            var filter = grid.BuildFilterWindow($(btn).parent().parent(), field, type);
            if (grid.filterTray == null)
                $(btn).parent().parent().append(filter);
            else {
                grid.filterTray.append(filter);
            }
            
            if (grid.Initialized)
                filter.find(".filterable-focusable").focus();
        }
    }

    this.ShowAdditionalFilterWindow = function (container, display, field, type) {
        var filter = grid.BuildAdditionalFilterWindow(container, display, field, type);
        grid.filterTray.append(filter);
    }

    this.BuildAdditionalFilterWindow = function (column, display, field, datatype) {
        var filterWindow = null;
        if (this.filterWindows[field] == null) {
            // Make a new one.
            this.filterWindows[field] = $("<div></div>").addClass("filter-window");
            this.filterWindows[field].data("column", column).data("window", this.filterWindows[field]).data("field", field).data("type", datatype)
        }
        filterWindow = this.filterWindows[field];

        filterWindow.empty().removeClass("hide");
        var header = $("<div>" + display + "</div>").addClass("filter-header");

        if (grid.filterTray == null) {
            header.append($("<span class=\"glyphicon glyphicon-remove\"></span>").on("click", function () {
                $(this).parent().parent().addClass("hide");
            }));
        }

        filterWindow.append(header);
        if (grid.filterTray == null)
            filterWindow.append($("<div></div>").addClass("clearfix"));

        switch (datatype) {
            case "string":
                this.BuildStringFilter(field, filterWindow);
                break;
            case "bool":
                this.BuildBoolFilter(field, filterWindow);
                break;
            case "date":
                this.BuildDateFilter(field, filterWindow);
                break;
            case "list":
                this.BuildListFilter(column, field, filterWindow);
        }

        var footer = $("<div></div>").addClass("filter-footer");
        //footer.append($("<button type=\"button\"><span class=\"glyphicon glyphicon-tick\"></span></button>").on("click", { column: column, window: filterWindow, field: field, type: datatype }, grid.ApplyFilter));
        if (!column.attr("data-force-filter"))
            footer.append($("<button type=\"button\"><span class=\"glyphicon glyphicon-remove\"></span></button>").on("click", { column: column, window: filterWindow, field: field, type: datatype }, grid.ClearFilter));
        filterWindow.append(footer);

        return filterWindow;
    }

    this.ApplyAllFilters = function (e) {
        grid.deferUpdate = true;
        for (var i in grid.filterWindows) {
            var filter = grid.filterWindows[i];
            if (!filter.hasClass("hidden") && !filter.hasClass("hide")) {
                // If filter hasn't been applied and filter is empty, don't apply it.
                if (grid.GetFilter(filter.data("field")) == null) {
                    if (grid.GetFilterValue(filter.data("type"), filter.data("field"), filter.data("window")) == "") {
                        continue;
                    }
                }

                grid.ApplyFilter({ data: { column: filter.data("column"), window: filter.data("window"), field: filter.data("field"), type: filter.data("type") } });
            }
        }
        grid.deferUpdate = false;
        grid.UpdateResults();
    }

    this.ApplyFilter = function (e) {
        var column = e.data.column;
        var field = e.data.field;
        var type = e.data.type;

        column.find(".glyphicon-filter").addClass("active-filter");
        grid.SetFilterForType(field, type, e.data.window);
        this.newFilter = true;

        if (grid.filterTray == null)
            grid.HideFilter(field);

        grid.page = 1;
        if (!grid.deferUpdate)
            grid.UpdateResults();
    }

    this.ClearFilter = function (e) {
        var column = e.data.column;
        column.find(".glyphicon-filter").removeClass("active-filter");

        var field = column.attr("data-filter");
        if (grid.activeFilters[field]) {
            delete grid.activeFilters[field];
        }
        grid.newFilter = true;
        grid.HideFilter(e.data.window);
        grid.HideFilter(field);
        grid.page = 1;
        grid.UpdateResults();
    }

    this.ClearFilterValue = function (field) {
        if (grid.filterWindows[field] != null) {
            grid.filterWindows[field].find("input").val("");
            grid.filterWindows[field].find("select").val("");
        }
    }

    this.HideFilter = function (field) {
        if (grid.filterWindows[field] != null)
            grid.filterWindows[field].addClass("hide");
        else {
            try {

            }
            catch (e) {
                field.addClass("hide");
            }
        }
    }

    this.GetFilterValue = function (type, field, filterWindow) {

        switch (type) {
            case "string":
                return this.GetStringFilter(field, filterWindow);
                break;
            case "bool":
                return this.GetBoolFilter(field, filterWindow);
                break;
            case "date":
                return this.GetDateFilter(field, filterWindow);
                break;
            case "list":
                return this.GetListFilter(field, filterWindow);
                break;
        }
    }

    this.SetFilterForType = function (field, type, filterWindow) {
        switch (type) {
            case "string":
                this.SetStringFilter(field, filterWindow);
                break;
            case "bool":
                this.SetBoolFilter(field, filterWindow);
                break;
            case "date":
                this.SetDateFilter(field, filterWindow);
                break;
            case "list":
                this.SetListFilter(field, filterWindow);
                break;
        }
    }

    this.SetFilter = function (field, value, type) {
        this.activeFilters[field] = { Data: value, Type: type };
    }

    this.GetFilter = function (field) {
        if (this.activeFilters[field]) {
            return this.activeFilters[field];
        }
        return null;
    }

    this.Initialize();
}

$(document).ready(function () {
    $(".filterable").each(function () {
        new com.Eynon.FilterGrid($(this));
    });
});