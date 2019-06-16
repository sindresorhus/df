import {expectType} from 'tsd';
import df = require('.')
import {SpaceInfo} from '.';

expectType<Promise<SpaceInfo[]>>(df());
expectType<Promise<SpaceInfo>>(df.fs('/dev/disk1'));
expectType<Promise<SpaceInfo>>(df.file('info.txt'));

const spaceInfo = await df.fs('/dev/disk1');

expectType<string>(spaceInfo.filesystem);
expectType<number>(spaceInfo.size);
expectType<number>(spaceInfo.used);
expectType<number>(spaceInfo.available);
expectType<number>(spaceInfo.capacity);
expectType<string>(spaceInfo.mountpoint);
