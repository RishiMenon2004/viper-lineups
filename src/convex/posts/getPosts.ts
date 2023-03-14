import { query } from "../_generated/server";

export const getPost = query(async ({db}, documentId) => {
	return await db.query("posts").filter(q => q.eq(q.field("_id"), documentId)).unique()
})

export const getFilteredPosts = query(async ({db}, tags?:{abilities: string[], sides: string[]}, map?:string) => {

	let posts = await db
	.query("posts")
	.order("desc")
	.collect()
	
	if (map !== undefined && map !== "") {
		if (map !== "All") {
			const postsFilteredByMap = posts.filter(post => {
				return post.map === map
			})
	
			posts = postsFilteredByMap
		}
	}

	if (tags !== undefined && (tags.abilities.length !== 0 || tags.sides.length !== 0)) {

		let postsFilteredByTags = posts

		if (tags.abilities.length !== 0){
			const postsFilteredByAbilityTags = postsFilteredByTags.filter(post => {
				let hasOneTag = false
				
				tags.abilities.every((tag) => {
					if (post.tags.includes(tag)) {
						hasOneTag = true
						return false
					}

					return true
				})

				return hasOneTag
			})

			postsFilteredByTags = postsFilteredByAbilityTags
		}

		if (tags.sides.length !== 0){
			const postsFilteredBySidesTags = postsFilteredByTags.filter(post => {
				let hasOneTag = false
				
				tags.sides.every((tag) => {
					if (post.tags.includes(tag)) {
						hasOneTag = true
						return false
					}

					return true
				})

				return hasOneTag
			})

			postsFilteredByTags = postsFilteredBySidesTags
		}
		
		posts = postsFilteredByTags
	}

	return posts
})