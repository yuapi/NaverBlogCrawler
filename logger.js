let productName = 'Default';

function logger(name) {
	productName = name;
}

function log(t) {
	const now = new Date();
	console.log(`[${("0"+now.getHours()).slice(-2)}:${("0"+now.getMinutes()).slice(-2)}:${("0"+now.getSeconds()).slice(-2)}] ${productName}: ${t}`);
} 

module.exports = { logger, log };