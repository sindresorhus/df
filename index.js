'use strict';
const execa = require('execa');

const run = args => execa('df', args).then(res =>
	res.stdout.trim().split('\n').slice(1).map(x => {
		const cl = x.split(/\s+(?=[\d/])/);

		return {
			filesystem: cl[0],
			size: parseInt(cl[1], 10) * 1024,
			used: parseInt(cl[2], 10) * 1024,
			available: parseInt(cl[3], 10) * 1024,
			capacity: parseInt(cl[4], 10) / 100,
			mountpoint: cl[5]
		};
	})
);

const df = () => run(['-kP']);

df.fs = name => {
	if (typeof name !== 'string') {
		return Promise.reject(new Error('name required'));
	}

	return run(['-kP']).then(data => {
		for (const x of data) {
			if (x.filesystem === name) {
				return x;
			}
		}

		throw new Error(`The specified filesystem \`${name}\` doesn't exist`);
	});
};

df.file = file => {
	if (typeof file !== 'string') {
		return Promise.reject(new Error('file required'));
	}

	return run(['-kP', file])
		.then(data => data[0])
		.catch(error => {
			if (/No such file or directory/.test(error.message)) {
				error = new Error(`The specified file \`${file}\` doesn't exist`);
			}

			throw error;
		});
};

module.exports = df;
