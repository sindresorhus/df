import {expectType} from 'tsd';
import {
	diskSpace,
	diskSpaceForFilesystem,
	diskSpaceForFilesystemOwningPath,
	SpaceInfo,
} from './index.js';

expectType<Promise<SpaceInfo[]>>(diskSpace());
expectType<Promise<SpaceInfo>>(diskSpaceForFilesystem('/dev/disk1'));
expectType<Promise<SpaceInfo>>(diskSpaceForFilesystemOwningPath('info.txt'));

const spaceInfo = await diskSpaceForFilesystem('/dev/disk1');

expectType<string>(spaceInfo.filesystem);
expectType<number>(spaceInfo.size);
expectType<number>(spaceInfo.used);
expectType<number>(spaceInfo.available);
expectType<number>(spaceInfo.capacity);
expectType<string>(spaceInfo.mountpoint);
