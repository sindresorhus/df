'use strict';
const execa = require('execa');
const parseColumns = require('parse-columns');

const identity = v => v;
const parseBlocks = str => parseInt(str, 10) * 1024;

const COLUMNS = {
	filesystem: identity,
	type: identity,
	size: parseBlocks,
	used: parseBlocks,
	available: parseBlocks,
	capacity: str => parseInt(str, 10) / 100,
	mountpoint: identity
};

const parseColumnsOptions = {
	headers: Object.keys(COLUMNS),
	transform: (element, header) => COLUMNS[header](element)
};

const parseOutput = output => parseColumns(output, parseColumnsOptions);

const run = async args => {
	const {stdout} = await execa('df', args);
	return parseOutput(stdout);
};

const df = async () => run(['-kPT']);

df.fs = async name => {
	if (typeof name !== 'string') {
		throw new TypeError('The `name` parameter required');
	}

	const data = await run(['-kPT']);

	for (const item of data) {
		if (item.filesystem === name) {
			return item;
		}
	}

	throw new Error(`The specified filesystem \`${name}\` doesn't exist`);
};

df.file = async file => {
	if (typeof file !== 'string') {
		throw new TypeError('The `file` parameter is required');
	}

	let data;
	try {
		data = await run(['-kPT', file]);
	} catch (error) {
		if (/No such file or directory/.test(error.stderr)) {
			throw new Error(`The specified file \`${file}\` doesn't exist`);
		}

		throw error;
	}

	return data[0];
};

module.exports = df;

if (process.env.NODE_ENV === 'test') {
	module.exports._parseOutput = parseOutput;
}
