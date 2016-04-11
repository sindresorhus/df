'use strict';
const execa = require('execa');

const run = args => {
	return execa('df', args).then(res => res.stdout.trim().split('\n').slice(1).map(x => {
		const cl = x.split(/\s+(?=[\d\/])/);

		return {
			filesystem: cl[0],
			size: parseInt(cl[1], 10) * 1024,
			used: parseInt(cl[2], 10) * 1024,
			available: parseInt(cl[3], 10) * 1024,
			capacity: parseInt(cl[4], 10) / 100,
			mountpoint: cl[5]
		};
	}));
};

const df = module.exports = () => run(['-kP']);

df.fs = name => {
	if (typeof name !== 'string') {
		return Promise.reject(new Error('name required'));
	}

	return run(['-kP']).then(data => {
		let ret;

		data.forEach(x => {
			if (x.filesystem === name) {
				ret = x;
			}
		});

		return ret;
	});
};

df.file = file => {
	if (typeof file !== 'string') {
		return Promise.reject(new Error('file required'));
	}

	return run(['-kP', file]).then(data => data[0]);
};
