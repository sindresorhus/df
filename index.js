import fs from 'node:fs/promises';
import process from 'node:process';
import {execa} from 'execa';

const isDarwin = process.platform === 'darwin';

const patternWithoutType = /^(?<filesystem>.+?)\s+(?<size>\d+)\s+(?<used>\d+)\s+(?<available>\d+)\s+(?<capacity>\d+)%\s+(?<mountpoint>.+)$/;
const patternWithType = /^(?<filesystem>.+?)\s+(?<type>\S+)\s+(?<size>\d+)\s+(?<used>\d+)\s+(?<available>\d+)\s+(?<capacity>\d+)%\s+(?<mountpoint>.+)$/;

let cachedMountTypes;
let cachedAt = 0;

const getMountTypes = async () => {
	const now = Date.now();
	if (cachedMountTypes && now - cachedAt < 2000) {
		return cachedMountTypes;
	}

	try {
		const {stdout} = await execa('mount', {timeout: 3000});
		const map = new Map();

		for (const line of stdout.trim().split('\n')) {
			const match = line.match(/^(?<device>.+?)\s+on\s+(?<mountpoint>.+?)\s+\((?<type>[^,]+)(?:,.*?)?\)$/);
			if (!match) {
				continue;
			}

			const {device, mountpoint, type} = match.groups;
			map.set(device.trim(), type.trim());
			map.set(mountpoint.trim(), type.trim());
		}

		cachedMountTypes = map;
		cachedAt = now;
		return map;
	} catch {
		return new Map();
	}
};

const parseOutput = (output, mountTypes) => {
	const [header, ...rows] = output.trim().split('\n');
	const hasType = /\b(type|fstype)\b/i.test(header);
	const pattern = hasType ? patternWithType : patternWithoutType;

	return rows.map(line => {
		const match = line.match(pattern);
		if (!match) {
			throw new Error(`Unable to parse df output line: ${line}`);
		}

		const {groups} = match;

		const info = {
			filesystem: groups.filesystem.trim(),
			type: (groups.type ?? '').trim(),
			size: Number.parseInt(groups.size, 10) * 1024,
			used: Number.parseInt(groups.used, 10) * 1024,
			available: Number.parseInt(groups.available, 10) * 1024,
			capacity: Number.parseInt(groups.capacity, 10) / 100,
			mountpoint: groups.mountpoint.trim(),
		};

		if (!hasType && mountTypes) {
			info.type = mountTypes.get(info.filesystem) ?? mountTypes.get(info.mountpoint) ?? '';
		}

		return info;
	});
};

let gnuOutputSupported; // `undefined | true | false``

const hasGnuOutput = async () => {
	if (gnuOutputSupported !== undefined) {
		return gnuOutputSupported;
	}

	try {
		await execa('df', ['--output=source', '-P'], {timeout: 2000});
		gnuOutputSupported = true;
	} catch {
		gnuOutputSupported = false;
	}

	return gnuOutputSupported;
};

const run = async (extraArguments = []) => {
	const useGnu = !isDarwin && await hasGnuOutput();

	const base = useGnu
		? ['-P', '--output=source,fstype,size,used,avail,pcent,target']
		: (isDarwin ? ['-kP'] : ['-kPT']);

	const arguments_ = [...base, ...extraArguments];
	const {stdout} = await execa('df', arguments_, {timeout: 5000});
	const mountTypes = isDarwin ? await getMountTypes() : undefined;
	return parseOutput(stdout, mountTypes);
};

export async function diskSpace() {
	return run();
}

export async function diskSpaceForFilesystem(pathToDeviceFile) {
	if (typeof pathToDeviceFile !== 'string') {
		throw new TypeError('The `pathToDeviceFile` parameter is required');
	}

	const data = await run();

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

	try {
		await fs.stat(path);
	} catch {
		throw new Error(`The given file/directory at \`${path}\` does not exist`);
	}

	const [row] = await run([path]);
	return row;
}

if (process.env.NODE_ENV === 'test') {
	diskSpace._parseOutput = parseOutput;
	diskSpace._getMountTypes = getMountTypes;
}
