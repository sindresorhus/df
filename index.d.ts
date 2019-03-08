export interface SpaceInfo {
	/**
	 * The name of the filesystem.
	 */
	readonly filesystem: string;

	/**
	 * Total size in bytes.
	 */
	readonly size: number;

	/**
	 * Used size in bytes.
	 */
	readonly used: number;

	/**
	 * Available size in bytes.
	 */
	readonly available: number;

	/**
	 * Capacity as a float from `0` to `1`.
	 */
	readonly capacity: number;

	/**
	 * Disk mount location.
	 */
	readonly mountpoint: string;
}

declare const df: {
	/**
	 * Get free disk space info from [`df -kP`](https://en.wikipedia.org/wiki/Df_\(Unix\)).
	 *
	 * @returns A list of space info objects for each filesystem.
	 */
	(): Promise<SpaceInfo[]>;

	/**
	 * @param filesystem - Path to a filesystem device file. Example: `'/dev/disk1'`.
	 * @returns The space info for the specified filesystem.
	 */
	fs(filesystem: string): Promise<SpaceInfo>;

	/**
	 * @param file - The path to a file on the filesystem to get the space info for.
	 * @returns The space info for the filesystem the supplied file is part of.
	 */
	file(file: string): Promise<SpaceInfo>;
};

export default df;
