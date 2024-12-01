document.addEventListener("DOMContentLoaded", () => {
    const chartContainer = document.getElementById("chart");
    const buttons = document.querySelectorAll("button[data-endpoint]");

    // Fetch data for graphs
    const fetchData = async (endpoint, graphType) => {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`Error fetching data from ${endpoint}`);
            const data = await response.json();
            renderGraph(chartContainer, data, graphType);
        } catch (error) {
            console.error("Error rendering graph:", error);
            chartContainer.innerHTML = `<p style="color: red;">Failed to load data. Check console for details.</p>`;
        }
    };

    // Build graph
    const renderGraph = (container, data, graphType) => {
        container.innerHTML = ""; // Очищаем контейнер
        switch (graphType) {
            case "network1":
            case "network2":
                renderNetworkGraph(container, data, graphType === "network2");
                break;
            case "pie":
                renderPieChart(container, data);
                break;
            case "bar":
                renderBarChart(container, data);
                break;
            case "datagrid":
                renderDataGrid(container, data);
                break;
            default:
                console.error("Unknown graph type");
        }
    };

    // Network Graph
    const renderNetworkGraph = (container, data, isSecondGraph) => {
        const graphData = [];
        data.forEach((group) => {
            group.data.forEach((value) => {
                graphData.push([group.name, value]);
            });
        });

        Highcharts.chart(container, {
            chart: { type: 'networkgraph', height: '600px' },
            title: { text: isSecondGraph ? "Network Graph 2" : "Network Graph 1" },
            plotOptions: { networkgraph: { keys: ['from', 'to'] } },
            series: [
                {
                    dataLabels: { enabled: true, linkFormat: '', allowOverlap: true },
                    data: graphData,
                },
            ],
        });
    };

    // Pie Chart
    const renderPieChart = (container, data) => {
        const chartData = Object.entries(data).map(([key, value]) => ({
            name: key,
            y: value,
        }));

        Highcharts.chart(container, {
            chart: { type: 'pie' },
            title: { text: "Pie Chart" },
            series: [{ name: "Counts", colorByPoint: true, data: chartData }],
        });
    };

    // Bar Chart
    const renderBarChart = (container, data) => {
        const categories = Object.keys(data);
        const values = Object.values(data);

        Highcharts.chart(container, {
            chart: { type: 'bar' },
            title: { text: "Bar Chart" },
            xAxis: { categories, title: { text: null } },
            yAxis: { min: 0, title: { text: "Counts", align: "high" } },
            series: [{ name: "Counts", data: values }],
        });
    };

    // Data Grid
    const renderDataGrid = (container, data) => {
        const table = document.createElement("table");
        table.classList.add("ui", "celled", "table");

        if (data.length === 0) {
            container.innerHTML = "<p>No data available.</p>";
            return;
        }

        // Exclude timestamp fields
        const keys = Object.keys(data[0]).slice(0, -2);

        // Create headers
        const header = document.createElement("thead");
        const headerRow = document.createElement("tr");
        keys.forEach((key) => {
            const th = document.createElement("th");
            th.textContent = key;
            headerRow.appendChild(th);
        });
        header.appendChild(headerRow);
        table.appendChild(header);

        // Create table rows
        const body = document.createElement("tbody");
        data.forEach((row) => {
            const tr = document.createElement("tr");
            keys.forEach((key) => {
                const td = document.createElement("td");
                td.textContent = row[key];
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        table.appendChild(body);

        container.innerHTML = ""; // Clear container before filling table with data
        container.appendChild(table);
    };


    // Обработчики кнопок
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const endpoint = button.getAttribute("data-endpoint");
            const graphType = button.getAttribute("data-graph-type"); // Graph type
            fetchData(endpoint, graphType);
        });
    });
});
