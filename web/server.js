const express = require("express");
const path = require("path");
const sequelize = require("../general/connect.js");
const {
  Vacancy_EasyPrace,
  Vacancy_Jobs,
  Vacancy_Prace,
  Vacancy_Pracezarohem,
  Vacancy_Profesia,
} = require("../general/models.js");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

// Group data
const groupData = (rows, column) =>
  rows.reduce((acc, row) => {
    const key = row[column];
    acc[key] = acc[key] || [];
    acc[key].push(row);
    return acc;
  }, {});

// Group data and count duplicates
const countGroups = (rows, column) =>
  rows.reduce((acc, row) => {
    const key = row[column];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

// Create endpoints
const createRoutesForModel = (route, Model) => {
  app.get(`/${route}/graph1`, async (req, res) => {
    try {
      const data = await Model.findAll();
      const grouped = groupData(data, "employer");
      const graphData = Object.entries(grouped).map(([key, values]) => ({
        name: key,
        data: values.map((v) => v.title),
      }));
      res.json(graphData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get(`/${route}/graph2`, async (req, res) => {
    try {
      const data = await Model.findAll();
      const grouped = groupData(data, "employer");
      const graphData = Object.entries(grouped).map(([key, values]) => ({
        name: key,
        data: values.map((v) => v.address),
      }));
      res.json(graphData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get(`/${route}/graph3`, async (req, res) => {
    try {
      const data = await Model.findAll();
      const counts = countGroups(data, "employer");
      res.json(counts);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get(`/${route}/graph4`, async (req, res) => {
    try {
      const data = await Model.findAll();
      const grouped = countGroups(data, "employer");
      const graphData = Object.keys(grouped).map((key) => ({
        name: key,
        y: grouped[key],
      }));
      res.json(graphData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get(`/${route}/graph5`, async (req, res) => {
    try {
      const data = await Model.findAll();
      res.json(data);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
};

// Initialize endpoints
createRoutesForModel("easyprace", Vacancy_EasyPrace);
createRoutesForModel("jobs", Vacancy_Jobs);
createRoutesForModel("prace", Vacancy_Prace);
createRoutesForModel("pracezarohem", Vacancy_Pracezarohem);
createRoutesForModel("profesia", Vacancy_Profesia);

// Start the server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
