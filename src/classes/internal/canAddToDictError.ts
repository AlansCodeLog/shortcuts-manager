import { crop, indent } from "@alanscodelog/utils"


export function canAddToDictErrorText(type: string, existingIdentifier: string, existingEntry: string, newEntry: string): string {
	return crop`
		${type} ${existingIdentifier} is already registered.
			Existing ${type}:
			${indent(existingEntry, 3)}
			New ${type}:
			${indent(newEntry, 3)}
		`
}
