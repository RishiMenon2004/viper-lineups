import './App.scss';
import { createContext, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { Doc } from '../convex/_generated/dataModel';
import { api } from '../convex/_generated/api';

import Search from './components/Search';
import SortingBar from './components/SortingBar';
import { PostViewer } from './components/Posts';
import { TagObject } from './components/Tags/tagObject';
import FilteredPosts from './components/Posts/FilteredPosts';

export const MobileContext = createContext<{
	isMobile: boolean,
	windowWidth: number
}>({isMobile: false, windowWidth: 0})

export const PostContext = createContext<Doc<"posts">>(null!)

export const PostsContext = createContext<{
	postsQuery?: Doc<"posts">[]
	searchQuery: string,
	currentOpenPost: Doc<"posts">,
	togglePost: (args: Doc<"posts">) => void,
	selectedTags: {
		abilities: TagObject[],
		sides: TagObject[]
	},
}>(null!)

function App() {

	/* Used to swap out mobile and desktop elements */
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [windowWidth, setWindowWidth] = useState<number>(0)

	function getWindowWidth() {
        const {clientWidth: width} = document.body
        return width
    }

    function handleResize() {
        setWindowWidth(getWindowWidth())
        setIsMobile(windowWidth <= 600)
    }

	useEffect(() => {
		handleResize()

		window.onpopstate = () => {
			if(currentOpenPost !== null!) {
				setCurrentOpenPost(null!)
			}
		}

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })
	/* =========================================== */

	const [currentOpenPost, setCurrentOpenPost] = useState<Doc<"posts">>(null!)
	
	const [selectedTags, setSelectedTags] = useState<{abilities: TagObject[], sides: TagObject[]}>({abilities: [], sides: []})
	const [selectedMap, setSelectedMap] = useState<string>("All")
	const [searchQuery, setSearchQuery] = useState<string>("")
	
	const postsQuery = useQuery(api.post.getFilteredPosts, {tags: selectedTags, map: selectedMap})
	
	/* Interractions */

	/* Tag interactions for the sorting bar */
	function handleTagClick(tag:TagObject, category: "ability"|"side") {
		let abilities = selectedTags.abilities
		let sides = selectedTags.sides

		switch(category) {
			case "ability": {
				if (abilities.includes(tag)) {
					abilities = abilities.filter(abilityTag => {
						return abilityTag !== tag
					})
				} else {
					abilities = [...abilities, tag]
				}
				break
			}

			case "side": {
				if (sides.includes(tag)) {
					sides = sides.filter(sideTag => {
						return sideTag !== tag
					})
				} else {
					sides = [...sides, tag]
				}
				break
			}

			default: break
		}

		setSelectedTags({abilities: abilities, sides: sides})
	}

	/* Toggle Post Viewing */
	function togglePost(post:Doc<"posts">) {
		if (post._id === currentOpenPost?._id) {
			window.history.back()
		} else {
			setCurrentOpenPost(post)
			window.history.pushState({}, '', "/open-post")
		}
	}

	/* check if the currently open post exists, whether it be deleted thru the ui or in the backend */
	useEffect(() => {
		if (postsQuery) {
			const existingDocument = postsQuery.find(post => {
				return currentOpenPost?._id === post._id
			})

			if (!existingDocument) {
				setCurrentOpenPost(null!)
				return
			}
		}
	}, [postsQuery, currentOpenPost])

	const mobileContext = {
		isMobile: isMobile,
		windowWidth: windowWidth
	}

	const postContext = {
		postsQuery,
		searchQuery,
		selectedTags,
		currentOpenPost,
		togglePost
	}

	const toggleCurrentPost = () => togglePost(currentOpenPost)

	return (<div className={"App" + ((currentOpenPost) ? " viewing-post" : "")}>		
		<MobileContext.Provider value={mobileContext}>
			<main className='main-area' tabIndex={-1}>
				<Search onChangeHandler={setSearchQuery}/>
				
				<SortingBar floating={!isMobile}
					handleTagClick={handleTagClick}
					handleSelectChange={setSelectedMap}/>
				
				<PostsContext.Provider value={postContext}>
					<div className="post-grid-wrapper">
						<div className="post-grid">
							<FilteredPosts/>
						</div>
					</div>
				</PostsContext.Provider>	
			</main>

			{currentOpenPost && (
				<PostContext.Provider value={currentOpenPost}>
					<PostViewer isActive={currentOpenPost && true}
						togglePostWithId={toggleCurrentPost} />
				</PostContext.Provider>
			)}
		</MobileContext.Provider>
	</div>)
}

export default App;