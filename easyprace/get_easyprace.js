"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.easy-prace.cz";

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

module.exports = async function getEasyPraceInfo()
{
    try
    {
        const easypraceData = await scrapPage(base_url);

        await fs.writeFile("easyprace/analysis_result.txt", analyzeData(easypraceData));

        return easypraceData;

    } catch(error)
    {
        console.error(error);
    }
}
async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        let easypraceData = [];
                
        // Delay time function
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms * 1000));

        // Scraping data on each page
        while (counter < 3) {
            console.log(counter);
            
            await delay(2); // Wait before request to lessen suspicion

            const response = await axios.get(`${base_url}/nabidka-zamestnani/${counter}`, { headers });

            const $ = cheerio.load(response.data);

            const $vacTitle = $(".nabidkaItem-title");

            // Checking if there are vacancies to be scraped on page
            if ($vacTitle.length === 0) {
                 hasMorePages = false;
                 break;
            }

            const $vacEmployer = $(".nabidkaItem-infoRow > a");
            const $vacAddress = $(".nabidkaItem-infoRow");
            const $vacSalary = $(".label-success");
            const $vacEmploymentType = $(".nabidkaItem-infoRow ~ div ~ div");
            const $vacLink = $(".nabidkaItem-title > a");

            // Bringing data to proper form and pushing it
            for (let i = 0; i < $vacTitle.length; i++) {
                easypraceData.push({
                    title: $vacTitle.eq(i).text().trim(),
                    employer: $vacEmployer.eq(i).text().trim(),
                    address: $vacAddress.eq(i).text().trim(),
                    salary: $vacSalary.eq(i).text(),
                    employment_type: $vacEmploymentType.eq(i).text().trim(),
                    link: base_url + $vacLink.eq(i).attr('href'),
                });
            }

            counter++;
        }

        return easypraceData;
    } catch (error) {
        console.error(error);
    }
}

function analyzeData(easypraceData) {
    let msg = "";
    const totalEasyprace = easypraceData.length;
    const attrNames = ["title", "employer", "address", "salary", "employment_type"]; // No need to analyze links column

    // Building statistics for each column
    attrNames.forEach(attr => {
        let wordCounts = [];
        let uniqueWords = new Set();
        let missingCount = 0;

        easypraceData.forEach(job => {
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
        const missingRatio = missingCount / totalEasyprace;

        msg +=  `Атрибут: ${attr}`+
        `\nОбщее количество: ${totalEasyprace}`+
        `\nМинимум слов: ${minWords}`+
        `\nМаксимум слов: ${maxWords}`+
        `\nСреднее количество слов: ${avgWords.toFixed(2)}`+
        `\nКоличество уникальных слов: ${uniqueWordCount}`+
        `\nДоля пропусков: ${(missingRatio * 100).toFixed(2)}%`+
        `\n-----------------------------------\n`;
    });
    return msg;
}
