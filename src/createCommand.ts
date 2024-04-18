import type { Command, RawCommand } from "./types/index.js"


export function createCommand<TCommand extends RawCommand>(
	name: TCommand["name"],
	rawCommand: Omit<TCommand, "name"> = {} as any
): Command<TCommand["name"]> {
	const command: Command = {
		type: "command",
		name,
		execute: rawCommand.execute,
		description: rawCommand.description ?? "",
		condition: rawCommand.condition ?? { type: "condition", text: "" },
	}
	return command
}
