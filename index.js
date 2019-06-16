'use strict';
const execa = require('execa');

const getColumnIndices = async header => {
	const regex = /(\S+\s+)/g;
	const indices = [];
	let i = 0;
	let spaceToNext = 0;
	let match;

	while ((match = regex.exec(header)) !== null) {
		let length;

		if (i === 0) {
			length = match[0].length;
		} else {
			length = match[0].trim().length;
		}

		indices.push(length + spaceToNext);
		spaceToNext = match[0].length - length;
		i++;
	}

	indices[i - 1] = header.length;

	return indices;
};

const parseOutput = async output => {
	const lines = output.trim().split('\n');
	const indices = await getColumnIndices(lines[0]);

	return lines.slice(1).map(line => {
		const cl = indices.map(index => {
			const column = line.substring(0, index);
			line = line.substring(index);
			return column.trim();
		});

		return {
			filesystem: cl[0],
			size: parseInt(cl[1], 10) * 1024,
			used: parseInt(cl[2], 10) * 1024,
			available: parseInt(cl[3], 10) * 1024,
			capacity: parseInt(cl[4], 10) / 100,
			mountpoint: cl[5]
		};
	});
};

const run = async args => {
	const {stdout} = await execa('df', args);

	return parseOutput(stdout);
};

const df = async () => run(['-kP']);

df.fs = async name => {
	if (typeof name !== 'string') {
		throw new TypeError('The `name` parameter required');
	}

	const data = await run(['-kP']);

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
		data = await run(['-kP', file]);
	} catch (error) {
		if (/No such file or directory/.test(error.message)) {
			throw new Error(`The specified file \`${file}\` doesn't exist`);
		}

		throw error;
	}

	return data[0];
};

module.exports = df;
// TODO: remove this in the next major version
module.exports.default = df;
