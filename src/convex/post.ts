import { query } from "./_generated/server"
import { mutation } from "./_generated/server"
import { Document } from "./_generated/dataModel"
import { TagObject } from "../components/Tags/tagObject"

export const createNewPost = mutation(async({db}, {title, body, images, abilities, side, map}: any) => {
	const post = {title, body, images, map, abilities: abilities, side: side}
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

function hasTag(tag: TagObject, checkArray: TagObject[]) {
	return checkArray.find(checkTag => {
		return checkTag.id === tag.id
	}) !== undefined
}

export const getFilteredPosts = query(async ({db, storage}, {abilities, sides}:{abilities: TagObject[], sides: TagObject[]}, map:string) => {

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
			return hasTag(post.side, sides) !== undefined 
		})

		postsFilteredByTags = postsFilteredBySidesTags
	}

	if (abilities.length !== 0){
		const postsFilteredByAbilityTags = postsFilteredByTags.filter(post => {
			let hasOneTag = false
			post.abilities.every(postTag => {
				hasOneTag = hasTag(postTag, abilities)
				return !hasOneTag
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