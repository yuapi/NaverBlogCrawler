const fs = require('fs');
const { logger, log } = require("./logger.js");
const { searchBlog } = require("./naverAPI.js");
const { crawlBlog } = require('./naverCrawler.js');

logger('NaverBlog-Crawler');

async function blogSearch(query, item=100, page=1) {
	// Value check
	if (!query) return log("index.js:blogSearch() query value is undefined.");
	if (item < 10 || item > 100) return log("index.js:blogSearch() item must be 10 or more and 100.");
	if ((item * page) > 1000) return log("index.js:blogSearch() page value error.");
	
	let resData = {
		keyword: query,
		searchDate: null,
		items: []
	};
	for (let i = 0; i < page; i++) {
		log(`serach API calling... (${i+1}/${page})`);
		const { error, data } = await searchBlog(query, item, (item * i) + 1);
		if (error) return log(error);

		if (i === 0) resData.searchDate = data.lastBuildDate;

		await resData.items.push(...data.items);
	}

	log(`JSON saving...`);
	await saveJSON(resData, `${query}.json`);
	return resData;
}

async function saveJSON(data, filename=null) {
	if (!filename) {
		const now = new Date();
		filename = `exportd_${now.getFullYear()}${("0"+(now.getMonth()+1)).slice(-2)}${("0"+now.getDate()).slice(-2)}_${("0"+now.getHours()).slice(-2)}${("0"+now.getMinutes()).slice(-2)}${("0"+now.getSeconds()).slice(-2)}.json`;
	}
	if (!filename.endsWith('.json')) return log("index.js:saveJSON() filename must be ends with \".json\".");

	await fs.writeFileSync(`./export/${filename}`, JSON.stringify(data));
	return true;
}

// Use if already have json.
async function loadJSON(filename) {
	try {
		if (!filename) return log("index.js:loadJSON() filename is undefined.");

		const data = await fs.readFileSync(`./export/${filename}`);
		return JSON.parse(data);
	} catch(error) {
		log(error);
		return false;
	}
}

async function run(query) {
	if (!query) return log("index.js:run() argument is undefined.");

	//const searchRes = await blogSearch(query, 10, 1);
	const searchRes = await loadJSON(`${query}.json`);
	await crawlBlog(searchRes);
	log('Completed!');
}

run(process.argv.slice(2).join(' '));