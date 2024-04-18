import { crop } from "@alanscodelog/utils/crop.js"
import { indent } from "@alanscodelog/utils/indent.js"


export function errorTextRemove(type: string, identifier: string, entries: string): string {
	return crop`
		${type} ${identifier} does not exist in entries:
			${indent(entries, 3)}
		`
}
