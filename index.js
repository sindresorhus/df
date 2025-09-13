import process from 'node:process';
import {execa} from 'execa';

const parseOutput = async output => {
	const lines = output.trim().split('\n');

	const createSpaceInfo = ({filesystem, type = '', size, used, available, capacity, mountpoint}) => ({
		filesystem: filesystem.trim(),
		type: type.trim(),
		size: Number.parseInt(size, 10) * 1024,
		used: Number.parseInt(used, 10) * 1024,
		available: Number.parseInt(available, 10) * 1024,
		capacity: Number.parseInt(capacity, 10) / 100,
		mountpoint: mountpoint.trim(),
	});

	return lines.slice(1).map(line => {
		const darwinPattern = /^(?<filesystem>.+?)\s+(?<size>\d+)\s+(?<used>\d+)\s+(?<available>\d+)\s+(?<capacity>\d+)%\s+(?<mountpoint>.+)$/;
		const linuxPattern = /^(?<filesystem>.+?)\s+(?<type>\S+)\s+(?<size>\d+)\s+(?<used>\d+)\s+(?<available>\d+)\s+(?<capacity>\d+)%\s+(?<mountpoint>.+)$/;

		const pattern = process.platform === 'darwin' ? darwinPattern : linuxPattern;
		const match = line.match(pattern);

		if (!match) {
			throw new Error(`Unable to parse df output line: ${line}`);
		}

		return createSpaceInfo(match.groups);
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
