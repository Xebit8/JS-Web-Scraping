"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.prace.cz/nabidky";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 7_0_2) Gecko/20100101 Firefox/53",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows; Windows NT 6.1; WOW64 Trident/5.0)",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; x64; en-US) Gecko/20100101 Firefox/62.3",
    "Mozilla/5.0 (Windows; U; Windows NT 10.0; Win64; x64; en-US) AppleWebKit/537.32 (KHTML, like Gecko) Chrome/48.0.3931.209 Safari/536.4 Edge/13.26854",
    "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 6.0;; en-US Trident/4.0)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 7_8_2; en-US) Gecko/20100101 Firefox/65.2",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_8_5; like Mac OS X) AppleWebKit/537.24 (KHTML, like Gecko) Chrome/52.0.3825.262 Mobile Safari/535.2",
    "Mozilla/5.0 (Linux; Linux i652 ) AppleWebKit/600.30 (KHTML, like Gecko) Chrome/54.0.2777.319 Safari/600",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 9_2_5; like Mac OS X) AppleWebKit/601.6 (KHTML, like Gecko) Chrome/50.0.3355.226 Mobile Safari/537.3",
    "Mozilla/5.0 (Android; Android 5.0; SM-G400 Build/LRX22C) AppleWebKit/537.48 (KHTML, like Gecko) Chrome/51.0.1416.156 Mobile Safari/533.9",
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