export interface TagObject {
	category: string,
	displayText: string,
	id: string
}

export const AllTags:TagObject[] = [
	{
		category: "side",
		displayText: "Attack",
		id: "attack"
	},
	{
		category: "side",
		displayText: "Defend",
		id: "defend"
	},

	{
		category: "ability",
		displayText: "Snakebite",
		id: "snakebite"
	},
	{
		category: "ability",
		displayText: "Poison Cloud",
		id: "poison_cloud"
	},
	{
		category: "ability",
		displayText: "Toxic Screen",
		id: "toxic_screen"
	},
	{
		category: "ability",
		displayText: "Viper's Pit",
		id: "vipers_pit"
	},
]