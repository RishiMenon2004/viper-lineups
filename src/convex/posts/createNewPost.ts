import { Document } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

export default mutation(async({db}, {title, body, images, tags, map}: Document<"posts">) => {
	const post = {title, body, images, tags, map}
	await db.insert("posts", post)
})