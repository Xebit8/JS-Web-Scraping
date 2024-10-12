const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


const url_jobs = "https://www.jobs.cz/prace/";
const url_easyprace = "https://www.easy-prace.cz/nabidka-zamestnani/";
const url_profesia = "https://www.profesia.sk/praca/";
const url_prace = "https://www.prace.cz/nabidky/";
const url_pracezarohem = "https://www.pracezarohem.cz/nabidky/";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
];
const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
const headers = {
    "User-agent": ua,
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
};
// fs.writeFile("response.txt", response.data, (error) => {
//     if (error) throw error;
// });





// (async function getJobsInfo()
// {
//     try
//     {
//         //let response = await axios.get(url_jobs);
//         // fs.writeFile("response.txt", `${response.data}`, (error) => {
//         //     if (error) throw error;
//         // });
//         let file_resdata = fs.readFileSync("response.txt").toString();
//         console.log(file_resdata);
        
//         const $ = cheerio.load(file_resdata);

//         const vacTitle = $(".SearchResultCard__titleLink");
//         //const vacEmployer = $("SearchResultCard__footerItem").text();
//         //const vacAddress = $("li[data-test=serp-locality]").text();
//         //const vacFeatures = $(".SearchResultCard__body > .Tag").text();
        
//         console.log(vacTitle);
//         //console.log(vacEmployer);
//         //console.log(vacAddress);
//         //console.log(vacFeatures);

        

//     } catch(error)
//     {
//         console.error(error);
//     }
// })();

// (async function getEasyPraceInfo()
// {
//     try
//     {
//         const response = await axios.get(url_easyprace);

//         const $ = cheerio.load(response.data);

//         const vacTitle = $(".nabidkaItem-title").title();
//         const vacEmployer = $(".nabidkaItem-infoRow > a").text();
//         const vacAddress = $(".nabidkaItem-infoRow").text();
//         const vacIncome = $(".label-success").text();
//         const vacEmploymentType = $(".nabidkaItem-infoRow")[2].text();

//     } catch(error)
//     {
//         console.error(error);
//     }
// })();

// (async function getProfesiaInfo()
// {
//     try
//     {
//         const response = await axios.get(url_profesia);

//         const $ = cheerio.load(response.data);

//         const vacTitle = $(".title").text();
//         const vacEmployer = $(".employer").text();
//         const vacAddress = $(".job-location").text();
//         const vacIncome = $(".label").text();

//     } catch(error)
//     {
//         console.error(error);
//     }
// })();

// (async function getPraceInfo()
// {
//     try
//     {
//         const response = await axios.get(url_prace);

//         const $ = cheerio.load(response.data);

//         const vacTitle = $(".half-standalone").text();
//         const vacEmployer = $(".search-result__advert__box__item--company").text();
//         const vacCity = $(".search-result__advert__box__item--location").text();
//         const vacIncome = $(".search-result__advert__box__item--salary").text();
//         const vacEmploymentType = $(".search-result__advert__box__item--employment-type");

//     } catch(error)
//     {
//         console.error(error);
//     }
// })();

// (async function getPracezarohemInfo()
// {
//     try
//     {
//         const response = await axios.get(url_pracezarohem);

//         const $ = cheerio.load(response.data);

//         const vacTitle = $(".typography-heading-small-text").text();
//         const vacEmployer = $(".company-name").text();
//         const vacAddress = $(".advert-address").text();
//         const vacIncome = $(".mb-2.d-flex").text();

//     } catch(error)
//     {
//         console.error(error);
//     }
// })();