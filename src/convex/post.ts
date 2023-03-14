import { query } from "./_generated/server"
import { mutation } from "./_generated/server"
import { TagObject } from "../components/Tags/TagObject"
import { Document } from "./_generated/dataModel"

export const createNewPost = mutation(async({db}, {title, body, images, tags, map}: any) => {
	const post = {title, body, images, tags, map}
	await db.insert("posts", post)
})

export const getPost = query(async ({db}, documentId) => {
	return await db.query("posts").filter(q => q.eq(q.field("_id"), documentId)).unique()
})

export const getFilteredPosts = query(async ({db}, tags:{abilities: TagObject[], sides: TagObject[]}, map:string) => {

	let posts = await db
	.query("posts")
	.order("desc")
	.collect()
	
	if (map !== "") {
		if (map !== "All") {
			const postsFilteredByMap = posts.filter(post => {
				return post.map === map
			})
	
			posts = postsFilteredByMap
		}
	}

	if (tags.abilities.length !== 0 || tags.sides.length !== 0) {

		let postsFilteredByTags = posts

		if (tags.abilities.length !== 0){
			const postsFilteredByAbilityTags = postsFilteredByTags.filter(post => {
				let hasOneTag = false
				
				tags.abilities.every((tag:TagObject) => {
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
				
				tags.sides.every((tag:TagObject) => {
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

export const deletePost = mutation(async({db, storage}, document?: Document<"posts">, documentId?: string) => {
	if (documentId !== undefined) {
		document = (await db.query("posts").collect()).find(post => {
			return post._id.id === documentId
		})
	}
	
	if (document !== undefined){
		const postImages = document.images.map(image => {return image.storageId})

		for (const storageId of postImages) {
			const imgDoc = await db.query("images").filter(q => q.eq(q.field("storageId"), storageId)).unique()

			if (imgDoc !== null) {
				await storage.delete(imgDoc.storageId)
				await db.delete(imgDoc._id)
			}
		}

		try {
			await db.delete(document._id)
		} 
		catch (err) {
			console.error(err)
			return ("Task Unsuccessful")
		}

		return "Successfully Deleted"
	}
})