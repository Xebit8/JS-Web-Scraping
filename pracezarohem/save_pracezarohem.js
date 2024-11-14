"use strict";


const { CronJob } = require("cron");
const sequelize = require("../general/connect.js");
const { Vacancy_Pracezarohem, Task } = require("../general/models.js");
const getPracezarohemInfo = require("./get_pracezarohem.js");

async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[pracezarohem.cz] Successfully connected to database!");

        let task_status = "Success";
        try {
            const jobs = await getPracezarohemInfo();
            console.log("[pracezarohem.cz] Data was successfully scraped!")

            for (let job of jobs) {
                await Vacancy_Pracezarohem.create(job);
            }
            console.log("[pracezarohem.cz] Data was successfully saved!");
        } catch (error) {
            console.error("[pracezarohem.cz] Failed to connect to database.", error);
            task_status = "Failure";
        }
        create_task(task_status);

    } catch (error) {
        console.error("[pracezarohem.cz] Failed to connect to database", error);
    }
}

async function create_task(task_status) {
    await Task.create({website: "pracezarohem.cz", status: task_status});
    console.log("[pracezarohem.cz] The task is done!");
}

const job = CronJob.from({
    cronTime: '0 2/5 * * * *',
    onTick: () => saveToDatabase(),
    start: true,
    timeZone: 'Europe/Moscow'
});