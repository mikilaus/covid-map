const axios = require("axios").default;
const parseCsv = require("csv-parse");
const { promisify } = require("util");
const parseCsvAsync = promisify(parseCsv);

const URL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/_DATE_.csv`;

async function download() {
	const date = new Date();
	date.setDate(date.getDate() - 1);

	const month = date.getMonth() + 1;
	const monthPadded = month < 10 ? `0${month}` : month;
	const day = date.getDate();
	const dayPadded = day < 10 ? `0${day}` : day;

	const yesterday = `${monthPadded}-${dayPadded}-${date.getFullYear()}`;
	const yesterdayUrl = URL.replace("_DATE_", yesterday);

	const res = await axios.get(yesterdayUrl);
	console.log(yesterdayUrl);
	return res.data;
}
async function parse(data) {
	const records = await parseCsvAsync(data, { from_line: 2 });
	const locations = records.map((record) => {
		const [
			fips,
			admin2,
			state,
			country,
			lastUpdated,
			latitude,
			longitude,
			confirmed,
			deaths,
			recovered,
			active,
			combinedKey,
		] = record;

		return {
			state,
			country,
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude),
			confirmed: parseInt(confirmed),
			deaths: parseInt(deaths),
			recovered: parseInt(recovered),
			combinedKey,
		};
	});

	return locations;
}

async function downloadAndParse() {
	const data = await download();
	const locations = await parse(data);

	return locations;
}

module.exports = {
	download,
	parse,
	downloadAndParse,
};
