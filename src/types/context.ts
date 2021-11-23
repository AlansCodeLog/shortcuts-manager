// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface RecursiveRecord {
	[key: string]: any | RecursiveRecord
}
