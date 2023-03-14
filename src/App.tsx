import './App.scss';
import { createContext, MutableRefObject, useEffect, useRef, useState } from 'react';
import { useQuery } from './convex/_generated/react';

import Search from './components/Search';
import SortingBar from './components/SortingBar';
import PostCard from './components/PostCard';
import PostViewer from './components/PostViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner} from '@fortawesome/free-solid-svg-icons';
import { Document, Id } from './convex/_generated/dataModel';

export const MobileContext = createContext<{isMobile: boolean, windowWidth: number}>({isMobile: false, windowWidth: 0})

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

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

	/* =========================================== */

	const [isPostViewOpen, setIsPostViewOpen] = useState<boolean>(false)
	const [currentOpenPostId, setCurrentOpenPostId] = useState<Id<"posts"> | undefined	>(undefined)
	const [selectedTags, setSelectedTags] = useState<{abilities: string[], sides: string[]}>({abilities: [], sides: []})
	const [selectedMap, setSelectedMap] = useState("All")
	const [searchQuery, setSearchQuery] = useState("")

	const postsQuery = useQuery("posts/getPosts:getFilteredPosts", selectedTags, selectedMap)
	const postsContainer = useRef() as MutableRefObject<HTMLDivElement>

	/* Interractions */
	
	function handleTagClick(tag:string, category:"ability"|"side") {
		let abilities = selectedTags.abilities
		let sides = selectedTags.sides

		switch(category) {
			case "ability": {
				if (abilities.includes(tag)) {
					let tagIndex = abilities.indexOf(tag)
		
					if (tagIndex > -1) { // only splice array when item is found
						abilities.splice(tagIndex, 1); // 2nd parameter means remove one item only
					}
			
				} else {
					abilities = [...abilities, tag]
				}
				break;
			}

			case "side": {
				if (sides.includes(tag)) {
					let tagIndex = sides.indexOf(tag)
		
					if (tagIndex > -1) { // only splice array when item is found
						sides.splice(tagIndex, 1); // 2nd parameter means remove one item only
					}
			
				} else {
					sides = [...sides, tag]
				}
				break;
			}
		}

		setSelectedTags({abilities: abilities, sides: sides})
	}

	function Posts({postsList}:any) {
		let search = searchQuery
		let tags = ""
		let connector = ""

		if (searchQuery !== "") {
			search = `"${searchQuery}"`
		}
		
		if (selectedTags.abilities.length > 0 || selectedTags.sides.length > 0) {
			tags = "Selected Tags"
		}
		
		if (searchQuery !== "" && (selectedTags.abilities.length > 0 || selectedTags.sides.length > 0)) {
			connector = "and"
		}

		let notMatchingMessage = `No Posts Matching: ${search} ${connector} ${tags}`

		if (postsList === undefined) {
			return <div className="fetching-message">
				<FontAwesomeIcon className="spinner-icon" icon={faSpinner}/> Fetching...
			</div>
		}

		if (postsList.length <= 0 ) {
			return <div className="fetching-message">{notMatchingMessage}</div>
		}

		return postsList.map((post: any, index: number) => { return (
			<PostCard
			selected={post._id === currentOpenPostId}
			key={index}
			data={post}
			onClick={() => togglePostWithId(post._id)}/>
		)})
	}
	
	function textSearchFilter() {
		let newFilteredPosts:Document<"posts">[] | undefined = postsQuery
		
		if (searchQuery !== "") {
			
			newFilteredPosts = postsQuery?.filter((post:Document<"posts">) => {
				const title = `${post.map} ${post.title} ${post.tags.join(" ").replace("_", " ")}`.toUpperCase()  
				
				let filterWords = searchQuery.toUpperCase().split(" ")

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
			})
		}

		return newFilteredPosts
	}

	const filteredPosts = textSearchFilter()

	let finalPosts:JSX.Element = <Posts postsList={filteredPosts}/>


	/* Toggle Post Viewing */

	function togglePostWithId(doc_id:any) {
		if (doc_id === currentOpenPostId) {
			setIsPostViewOpen(false)
			setCurrentOpenPostId(undefined)
		} else {
			setIsPostViewOpen(true)
			setCurrentOpenPostId(doc_id)
		}
	}

	return (<div className={"App" + ((isPostViewOpen && currentOpenPostId !== undefined) ? " viewing-post" : "")}>
		{!isMobile && <SortingBar
			floating={true}
			handleTagClick={handleTagClick}
			handleSelectChange={setSelectedMap}
		/>}
		
		<MobileContext.Provider value={{isMobile: isMobile, windowWidth: windowWidth}}>
			<main className='main-area' tabIndex={-1}>
				<Search onChangeHandler={setSearchQuery}/>
				
				{isMobile && <SortingBar
					floating={false}
					handleTagClick={handleTagClick}
					handleSelectChange={setSelectedMap}
				/>}
				
				<div ref={postsContainer} className="post-grid">
					{finalPosts}
				</div>
			</main>

			{(currentOpenPostId !== undefined) && (<>
				<PostViewer 
					isActive={isPostViewOpen}
					currentOpenPostId={currentOpenPostId}
					togglePostWithId={() => togglePostWithId(currentOpenPostId)}
				/>
			</>)}
		</MobileContext.Provider>
	</div>)
}

export default App;