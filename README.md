## Czech vacancies aggregator
### Description
Web-application to get information about czech job vacancies and analyze it with visualization tools using JavaScript and PostgreSQL.

The data is collected by scrapers using Axios and Cheerio, stored in PostgreSQL database using Sequelize. Web-application frontend includes diagrams (graphs) from Highcharts and page elements from Semantic UI. Backend is built with Express.
### Here are some screnshots
#### The main page:
![screenshot](src/main_page.png)
#### Network graph to display titles per employer:
![screenshot](src/network_graph1.png)
#### Network graph to display vacancy addresses per employer:
![screenshot](src/network_graph2.png)
#### Pie chart to display vacancies quantity per employer:
![screenshot](src/pie_chart.png)
#### Bar chart to display vacancies quantity per employer:
![screenshot](src/bar_chart.png)
#### Data grid (or simply table) with all information about vacancies:
![screenshot](src/data_grid.png)
