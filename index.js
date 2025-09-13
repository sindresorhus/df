import process from 'node:process';
import {execa} from 'execa';

const getColumnBoundaries = async header => {
	// Regex captures each individual column
	let regex = /^Filesystem\s+|Type\s+|1024-blocks|\s+Used|\s+Available|\s+Capacity|\s+Mounted on\s*$/g;

	if (process.platform === 'darwin') {
		regex = /^Filesystem\s+|1024-blocks|\s+Used|\s+Available|\s+Capacity|\s+Mounted on\s*$/g;
	}

	const boundaries = [];
	let match;

	while ((match = regex.exec(header))) {
		boundaries.push(match[0].length);
	}

	// Extend last column boundary
	boundaries[boundaries.length - 1] = -1;

	return boundaries;
};

const parseOutput = async output => {
	const lines = output.trim().split('\n');
	const boundaries = await getColumnBoundaries(lines[0]);

	return lines.slice(1).map(line => {
		const cl = boundaries.map(boundary => {
			// Handle extra-long last column
			const column = boundary > 0 ? line.slice(0, boundary) : line;
			line = line.slice(boundary);
			return column.trim();
		});

		// https://github.com/sindresorhus/df/issues/15
		if (process.platform === 'darwin') {
			cl.splice(1, 0, '');
		}

		return {
			filesystem: cl[0],
			type: cl[1],
			size: Number.parseInt(cl[2], 10) * 1024,
			used: Number.parseInt(cl[3], 10) * 1024,
			available: Number.parseInt(cl[4], 10) * 1024,
			capacity: Number.parseInt(cl[5], 10) / 100,
			mountpoint: cl[6],
		};
	});
};

const run = async arguments_ => {
	// https://github.com/sindresorhus/df/issues/15
	if (process.platform === 'darwin') {
		arguments_[0] = arguments_[0].replace(/T$/, '');
	}

	const {stdout} = await execa('df', arguments_);
	return parseOutput(stdout);
};

export async function diskSpace() {
	return run(['-kPT']);
}

export async function diskSpaceForFilesystem(pathToDeviceFile) {
	if (typeof pathToDeviceFile !== 'string') {
		throw new TypeError('The `pathToDeviceFile` parameter is required');
	}

	const data = await run(['-kPT']);

	for (const item of data) {
		if (item.filesystem === pathToDeviceFile) {
			return item;
		}
	}

	throw new Error(`The specified filesystem \`${pathToDeviceFile}\` does not exist`);
}

export async function diskSpaceForFilesystemOwningPath(path) {
	if (typeof path !== 'string') {
		throw new TypeError('The `path` parameter is required');
	}

	let data;
	try {
		data = await run(['-kPT', path]);
	} catch (error) {
		if (/No such file or directory/.test(error.stderr)) {
			throw new Error(`The given file/directory at \`${path}\` does not exist`);
		}

		throw error;
	}

	return data[0];
}

if (process.env.NODE_ENV === 'test') {
	diskSpace._parseOutput = parseOutput;
}
