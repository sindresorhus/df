'use strict';
const execa = require('execa');

const run = async args => {
	const {stdout} = await execa('df', args);

	return stdout.trim().split('\n').slice(1).map(line => {
		const cl = line.split(/\s+(?=[\d/])/);

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
