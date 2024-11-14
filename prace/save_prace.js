"use strict";


const { CronJob } = require("cron");
const sequelize = require("../general/connect.js");
const { Vacancy_Prace, Task } = require("../general/models.js");
const getPraceInfo = require("./get_prace.js");

async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[prace.cz]  Successfully connected to database!");

        let task_status = "Success";
        try {
            const jobs = await getPraceInfo();
            console.log("[prace.cz] Data was successfully scraped!")

            for (let job of jobs) {
                await Vacancy_Prace.create(job);
            }
            console.log("[prace.cz] Data was successfully saved!");
        } catch (error) {
            console.error("[prace.cz] Failed to connect to database.", error);
            task_status = "Failure";
        }
        create_task(task_status);

    } catch (error) {
        console.error("[prace.cz] Failed to connect to database", error);
    }
}

async function create_task(task_status) {
    await Task.create({website: "prace.cz", status: task_status});
    console.log("[prace.cz] The task is done!");
}

const job = CronJob.from({
    cronTime: '0 3/5 * * * *',
    onTick: () => saveToDatabase(),
    start: true,
    timeZone: 'Europe/Moscow'
});