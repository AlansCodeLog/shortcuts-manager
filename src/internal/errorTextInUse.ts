import { crop } from "@alanscodelog/utils/crop.js"
import { indent } from "@alanscodelog/utils/indent.js"


export function errorTextInUse(type: "command" | "key", identifier: string, list: string): string {
	return crop`
		Cannot remove ${type} ${identifier}, it is in use by the following shortcuts:
		${indent(list, 2)}
	`
}
