import { Infer } from "convex/schema"
import { tagSchema } from "../../convex/schema"


export type TagObject = Infer<typeof tagSchema>

export const SideTags:TagObject[] = [
	{
		displayText: "Attack",
		id: "attack"
	},
	{
		displayText: "Defend",
		id: "defend"
	},
]

export const AbilityTags:TagObject[] = [
	{
		displayText: "Snakebite",
		id: "snakebite"
	},
	{
		displayText: "Poison Cloud",
		id: "poison_cloud"
	},
	{
		displayText: "Toxic Screen",
		id: "toxic_screen"
	},
	{
		displayText: "Viper's Pit",
		id: "vipers_pit"
	},
]