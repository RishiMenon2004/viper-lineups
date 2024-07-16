import { useContext } from 'react';
import { Doc } from '../../../convex/_generated/dataModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner} from '@fortawesome/free-solid-svg-icons';
import { PostsContext } from '../../App';
import { PostCard } from './PostCard';

export default function FilteredPosts() {
	let search = ""
	let tags = ""
	let connector = ""

	const {
		postsQuery,
		searchQuery,
		selectedTags,
		currentOpenPost,
		togglePost
	} = useContext(PostsContext)


	/* Filtering the queries posts */
	function textSearchFilter() {
		let newFilteredPosts:Doc<"posts">[] = postsQuery ?? []
		
		if (searchQuery !== "") {
			newFilteredPosts = postsQuery?.filter((post:Doc<"posts">) => {
				const title = `${post.map} ${post.title} ${post.abilities.map(tag => {return tag.displayText}).join(" ")} ${post.side.displayText}`.replace("_", " ").toUpperCase()  
				
				const filterWords = searchQuery.toUpperCase().split(" ")

				let hasMatch = false

				filterWords.every(word => {
					if (title.includes(word)) {
						hasMatch = true
						return true
					} else {
						hasMatch = false
						return false
					} 
				})
				return hasMatch
			}) ?? []
		}

		return newFilteredPosts
	}

	const postsList = textSearchFilter()
	const success = postsList.length > 0

	if (!postsQuery) {
		return <div className="fetching-message">
			<FontAwesomeIcon icon={faSpinner} spinPulse/> Fetching...
		</div>
	}

	if (!success) {
		if (searchQuery !== "") {
			search = `"${searchQuery}"`

			if ((selectedTags.abilities.length > 0 || selectedTags.sides.length > 0)) {
				connector = "and"
			}
		}
		
		if (selectedTags.abilities.length > 0 || selectedTags.sides.length > 0) {
			tags = "Selected Tags"
		}

		if (postsList.length <= 0) {
			return <div className="fetching-message">No Posts Matching: {`${search} ${connector} ${tags}`}</div>
		}
	}


	return postsList.map((post, index: number) => { 
		return (<PostCard
			selected={post._id === currentOpenPost?._id}
			key={index}
			data={post}
			onClick={() => togglePost(post)}
		/>)
	})
}