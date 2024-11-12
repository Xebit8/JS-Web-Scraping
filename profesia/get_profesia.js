"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.profesia.cz";

// Alternating userAgents (Tiny measures to bypass the blocking)
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
];
const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
const headers = {
    "User-agent": ua,
};

module.exports = async function getProfesiaInfo()
{
    try
    {
        const profesiaData = await scrapPage(base_url);

        await fs.writeFile("profesia/analysis_result.txt", analyzeData(profesiaData));

        return profesiaData;


    } catch(error)
    {
        console.error(error);
    }
}
async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        let profesiaData = [];
                
        // Delay time function
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms * 1000));

        // Scraping data on each page
        while (counter < 3) {
            console.log(counter);
            
            await delay(2); // Wait before request to lessen suspicion

            const response = await axios.get(`${base_url}/prace?page_num=${counter}`, { headers });

            const $ = cheerio.load(response.data);

            const $vacTitle = $(".title");

            // Check if there are vacancies to be scraped on page
            if ($vacTitle.length === 0) {
                hasMorePages = false;
                break;
            }

            const $vacEmployer = $(".employer");
            const $vacAddress = $(".job-location");
            const $vacSalary = $(".label");
            const $vacLink = $(".list-row > h2 > a")

            // Bringing data to proper form and pushing it
            for (let i = 0; i < $vacTitle.length; i++) {
                profesiaData.push({
                    title: $vacTitle.eq(i).text(),
                    employer: $vacEmployer.eq(i).text(),
                    address: $vacAddress.eq(i).text(),
                    salary: $vacSalary.eq(i).text().trim(),
                    link: base_url + $vacLink.eq(i).attr('href'),
                });
            }
            counter++;
        }
        return profesiaData;

    } catch (error) {
        console.error(error);
    }
}
function analyzeData(profesiaData) {
    let msg = "";
    const totalProfesia = profesiaData.length;
    const attrNames = ["title", "employer", "address", "salary"]; // No need to analyze links column

    // Building statistics for each column
    attrNames.forEach(attr => {
        let wordCounts = [];
        let uniqueWords = new Set();
        let missingCount = 0;

        profesiaData.forEach(job => {
            const value = job[attr];
            if (!value) {
                missingCount++;
            } else {
                const words = value.split(/\s+/);
                wordCounts.push(words.length);
                words.forEach(word => uniqueWords.add(word));
            }
        });

        const minWords = Math.min(...wordCounts);
        const maxWords = Math.max(...wordCounts);
        const avgWords = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
        const uniqueWordCount = uniqueWords.size;
        const missingRatio = missingCount / totalProfesia;

        msg +=  `Атрибут: ${attr}`+
        `\nОбщее количество: ${totalProfesia}`+
        `\nМинимум слов: ${minWords}`+
        `\nМаксимум слов: ${maxWords}`+
        `\nСреднее количество слов: ${avgWords.toFixed(2)}`+
        `\nКоличество уникальных слов: ${uniqueWordCount}`+
        `\nДоля пропусков: ${(missingRatio * 100).toFixed(2)}%`+
        `\n-----------------------------------\n`;
    });
    return msg;
}