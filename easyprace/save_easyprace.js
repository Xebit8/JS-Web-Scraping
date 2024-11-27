"use strict";


const { CronJob } = require("cron");
const sequelize = require("../general/connect.js");
const { Vacancy_EasyPrace, Task } = require("../general/models.js");
const getEasypraceInfo = require("./get_easyprace.js");

(async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[easy-prace.cz] Successfully connected to database!");

        let task_status = "Success";
        try {
            await Vacancy_EasyPrace.truncate({restartIdentity: true});
            console.log("[easy-prace.cz] All old data was successfully deleted!");

            const jobs = await getEasypraceInfo();
            console.log("[easy-prace.cz] Data was successfully scraped!");

            await Vacancy_EasyPrace.bulkCreate(jobs);
            console.log("[easy-prace.cz] New data was successfully saved!");
        } catch (error) {
            console.error("[easy-prace.cz] Failed to connect to database.", error);
            task_status = "Failure";
        }
        create_task(task_status);

    } catch (error) {
        console.error("[easy-prace.cz] Failed to connect to database", error);
    }
}())

async function create_task(task_status) {
    await Task.create({website: "easy-prace.cz", status: task_status});
    console.log("[easy-prace.cz] The task is done!");
}

// const job = CronJob.from({
//     cronTime: '0 4/5 * * * *',
//     onTick: () => saveToDatabase(),
//     start: true,
//     timeZone: 'Europe/Moscow'
// });