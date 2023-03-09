import { query } from "../_generated/server";

export default query(async ({db}, tags?:string[], map?:string) => {

	let posts = await db
	.query("posts")
	.collect()
	
	
	if (map !== undefined && map !== "") {
		if (map !== "All") {
			const filterPostsByMap = posts.filter(post => {
				return post.map === map
			})
	
			posts = filterPostsByMap
		}
	}
	
	if (tags !== undefined && tags.length !== 0) {
		const filterPostsByTags = posts.filter(post => {	
			return tags.every((tag) => {
				return post.tags.indexOf(tag) !== -1
			})
		}) 
		
		posts = filterPostsByTags
	}

	return posts
})