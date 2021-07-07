import type { Condition, Context } from "@/classes"


export type ConditionOptions = {
	eval: (self: Condition, context: Context) => boolean
	equals?: (self: Condition, condition: Condition) => boolean
}
