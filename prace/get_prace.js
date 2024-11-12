"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.prace.cz/nabidky";

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

module.exports = async function getPraceInfo()
{
    try
    {
        const praceData = await scrapPage(base_url);

        await fs.writeFile("prace/analysis_result.txt", analyzeData(praceData));

        return praceData;

    } catch(error)
    {
        console.error(error);
    }
}
async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        let praceData = [];
                
        // Delay time function
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms * 1000));

        // Scraping data on each page
        while (counter < 3) {
            // Try-Else to intercept error 404
            try {
                console.log(counter);
                
                await delay(2); // Wait before request to lessen suspicion

                const response = await axios.get(`${base_url}?page=${counter}`, { headers });

                const $ = cheerio.load(response.data);

                if (response.status === 404) {
                    hasMorePages = false; 
                    break;
                }

                const $vacTitle = $(".search-result__advert .half-standalone > .link > strong");
                const $vacEmployer = $(".search-result__advert__box__item--company");
                const $vacCity = $(".search-result__advert__box__item--location");
                const $vacSalary = $(".search-result__advert__box__item--salary");
                const $vacEmploymentType = $(".search-result__advert__box__item--employment-type");
                const $vacLink = $(".search-result__advert .link");

                // Bringing data to proper form and pushing it
                for (let i = 0; i < $vacTitle.length; i++) {
                    praceData.push({
                        title: $vacTitle.eq(i).text(),
                        employer: $vacEmployer.eq(i).text().replace('•', '').trim(),
                        city: $vacCity.eq(i).text().replace(/\s+/g, ' ').trim(),
                        salary: $vacSalary.eq(i).text().trim(),
                        employment_type: $vacEmploymentType.eq(i).text().replace('•', '').trim(),
                        link: $vacLink.eq(i).attr('href'),
                    });
                }
                counter++;

            } catch (error) {
                console.error(error);
                hasMorePages = false;
            }
        }
        return praceData;

    } catch (error) {
        console.error(error);
    }
}

function analyzeData(praceData) {
    let msg = "";
    const totalPrace = praceData.length;
    const attrNames = ["title", "employer", "city", "salary", "employment_type"]; // No need to analyze links column

    // Building statistics for each column
    attrNames.forEach(attr => {
        let wordCounts = [];
        let uniqueWords = new Set();
        let missingCount = 0;

        praceData.forEach(job => {
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
        const missingRatio = missingCount / totalPrace;

        msg +=  `Атрибут: ${attr}`+
                `\nОбщее количество: ${totalPrace}`+
                `\nМинимум слов: ${minWords}`+
                `\nМаксимум слов: ${maxWords}`+
                `\nСреднее количество слов: ${avgWords.toFixed(2)}`+
                `\nКоличество уникальных слов: ${uniqueWordCount}`+
                `\nДоля пропусков: ${(missingRatio * 100).toFixed(2)}%`+
                `\n-----------------------------------\n`;
    });
    return msg;
}