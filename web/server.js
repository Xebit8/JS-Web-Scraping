const express = require('express');
const path = require('path');
const sequelize = require('../general/connect.js');
const { Vacancy_EasyPrace, Vacancy_Jobs, Vacancy_Prace, Vacancy_Pracezarohem, Vacancy_Profesia } = require('../general/models.js');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/easyprace', async (req, res) => {
  try {
    const data = await Vacancy_EasyPrace.findAll()
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error " + err);
  }
});

app.get('/jobs', async (req, res) => {
    try {
      const data = await Vacancy_Jobs.findAll()
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error " + err);
    }
  });

app.get('/prace', async (req, res) => {
    try {
      const data = await Vacancy_Prace.findAll()
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error " + err);
    }
});

app.get('/pracezarohem', async (req, res) => {
    try {
      const data = await Vacancy_Pracezarohem.findAll()
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error " + err);
    }
});

app.get('/profesia', async (req, res) => {
    try {
      const data = await Vacancy_Profesia.findAll()
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error " + err);
    }
});

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log("\nheyyy\n")
    console.log(`Server running at http://localhost:${port}`);
  });
});