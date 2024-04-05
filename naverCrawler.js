const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { log } = require('./logger.js')

async function createCSV(data, filename=null) {
	if (!filename) {
		const now = new Date();
		filename = `exportd_${now.getFullYear()}${("0"+(now.getMonth()+1)).slice(-2)}${("0"+now.getDate()).slice(-2)}_${("0"+now.getHours()).slice(-2)}${("0"+now.getMinutes()).slice(-2)}${("0"+now.getSeconds()).slice(-2)}.csv`;
	}
	if (!filename.endsWith('.csv')) return log("index.js:createCSV() filename must be ends with \".csv\".");

	const text = ['title,content,postdate,blogId,blogName'];
	await data.forEach((v, i) => {
		text[i+1] = (`\"${v.title}\",\"${v.content}\",\"${v.postdate}\",\"${v.blogId}\",\"${v.blogName}\"`);
	});

	await fs.writeFileSync(`./export/${filename}`, text.join('\n'), { encoding: 'utf-8' });
	return true;
}

async function crawlBlog(d) {
	let cnt = 1;
	const crawlRes = [];
	for (let e of d.items) {
		log(`Crawling... (${cnt++}/${d.items.length}) ${e.link}`);
		if (!e.link.startsWith('https://blog.naver.com/')) continue;
		const parseRes = await parseBlog(e.link);

		await crawlRes.push({
			title: parseRes.title,
			content: parseRes.content,
			postdate: e.postdate,
			blogId: e.bloggerlink.split('/').pop(),
			blogName: e.bloggername
		});
	}
	createCSV(crawlRes, `${d.keyword}.csv`);
	return true;
}

async function parseBlog(url) {
	// Arguments value check
	if (!url) return log("naverCrawl.js:parseBlog() No url address.")

	const [blogId, logNo] = url.replace('https://blog.naver.com/', '').split('/');

	const { error, data } = await get(blogId, logNo);
	if (error) return log(error);

	const $ = cheerio.load(data);
	const title = $(`div.se-documentTitle > div > div > div.pcol1`).text().replace(/\n/g, '').replace(/\s\s+/g, '').trim();
	const content = $(`div.se-main-container`).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').replace(/​*/g, '').trim();

	return { title: title, content: content };
}

async function get(blogId, logNo) {
	if (!blogId) return log("naverCrawl.js:get() blogId is undefined.")
	if (!logNo) return log("naverCrawl.js:get() logNo is undefined.")

	try {
		const response = await axios.get('/PostView.naver', {
			baseURL: 'https://blog.naver.com',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
			},
			params: {
				blogId: blogId,
				logNo: logNo,
				redirect: 'Dlog',
				widgetTypeCall: true,
				noTrackingCode: true,
				directAccess: false
			}
		});
		return { error: null, response: response, data: response.data };
	}
	catch (error) {
		return { error: error, response: null, data: null };
	}
}

module.exports = { crawlBlog };