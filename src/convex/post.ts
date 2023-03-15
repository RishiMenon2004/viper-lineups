import { query } from "./_generated/server"
import { mutation } from "./_generated/server"
import { Infer } from "convex/schema"
import { tagSchema } from "./schema"
import { Document } from "./_generated/dataModel"

export const createNewPost = mutation(async({db}, {title, body, images, tags, map}: any) => {
	const post = {title, body, images, tags, map, abilities: [], side: {displayText: "", id: ""}}
	await db.insert("posts", post)
})

export const getPost = query(async ({db, storage}, documentId) => {
	const post = await db.query("posts").filter(q => q.eq(q.field("_id"), documentId)).unique()

	if (post) {
		for (const image of post.images) {
			const downloadUrl =  await storage.getUrl(image.storageId)
			if (downloadUrl) {
				image.url = downloadUrl
			}
		}
	}

	return post
})

export const getFilteredPosts = query(async ({db, storage}, {abilities, sides}:{abilities: Infer<typeof tagSchema>[], sides: Infer<typeof tagSchema>[]}, map:string) => {

	let posts = (map !== "" && map !== "All") ? 
	await db
		.query("posts")
		.withIndex("by_map", q => q.eq("map", map))
		.order("desc")
		.collect()
	: await db
		.query("posts")
		.order("desc")
		.collect()

	let postsFilteredByTags = posts

	if (sides.length !== 0) {
		const postsFilteredBySidesTags = postsFilteredByTags.filter(post => {
			
			const hasTag = sides.find(tag => {
				return tag.id === post.side.id
			}) !== undefined

			return hasTag
		})

		postsFilteredByTags = postsFilteredBySidesTags
	}

	if (abilities.length !== 0){
		const postsFilteredByAbilityTags = postsFilteredByTags.filter(post => {
			let hasOneTag = false

			post.abilities.every(postTag => {

				let objone = {id: "snakebite"}
				let objtwo = {id: "snakebite"}

				console.log(objone === objtwo)

				if (abilities.find(tag => tag.id === postTag.id)) {
					hasOneTag = true
					console.log(hasOneTag)
					return false
				}

				return true
			})

			return hasOneTag
		})

		postsFilteredByTags = postsFilteredByAbilityTags
	}
	
	posts = postsFilteredByTags

	for (const post of posts) {
		for (const image of post.images) {
			const downloadUrl =  await storage.getUrl(image.storageId)
			if (downloadUrl) {
				image.url = downloadUrl
			}
		}
	}

	return posts
})

export const deletePost = mutation(async({db, storage}, document?: Document<"posts">, documentId?: string) => {
	if (documentId !== undefined) {
		document = (await db.query("posts").collect()).find(post => {
			return post._id.id === documentId
		})
	}
	
	if (document){
		const postImages = document.images.map(image => {return image.storageId})

		for (const storageId of postImages) {
			await storage.delete(storageId)
		}

		await db.delete(document._id)

		return "Successfully Deleted"
	}
})