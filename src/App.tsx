import './App.scss';
import { createContext, useEffect, useState } from 'react';
import { useQuery } from './convex/_generated/react';
import { Document } from './convex/_generated/dataModel';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner} from '@fortawesome/free-solid-svg-icons';

import Search from './components/Search';
import SortingBar from './components/SortingBar';
import { PostCard, PostViewer } from './components/Posts';
import { TagObject } from './components/Tags/tagObject';

export const MobileContext = createContext<{isMobile: boolean, windowWidth: number}>({isMobile: false, windowWidth: 0})
export const PostContext = createContext<Document<"posts"> | any>(undefined)

function App() {

	window.addEventListener('load', function() {
		window.history.pushState({}, '')
	})

	window.addEventListener('popstate', function() {
		window.history.pushState({}, '')
		setCurrentOpenPost(undefined)
	})

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

	const [currentOpenPost, setCurrentOpenPost] = useState<Document<"posts"> | undefined>(undefined)
	
	const [selectedTags, setSelectedTags] = useState<{abilities: TagObject[], sides: TagObject[]}>({abilities: [], sides: []})
	const [selectedMap, setSelectedMap] = useState("All")
	const [searchQuery, setSearchQuery] = useState("")
	
	const postsQuery = useQuery("post:getFilteredPosts", selectedTags, selectedMap)

	function checkIfCurrentExists() {
		if (currentOpenPost && postsQuery) {
			const existingDocument = postsQuery.find(post => {
				return currentOpenPost._id === post._id
			})

			if (existingDocument === undefined) {
				setCurrentOpenPost(undefined)
				return
			}
		}
	}

	useEffect(() => {
		checkIfCurrentExists()
	})
	
	/* Interractions */
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
		}

		setSelectedTags({abilities: abilities, sides: sides})
	}

	/* Filtering the queries posts */
	function textSearchFilter() {
		let newFilteredPosts:Document<"posts">[] | undefined = postsQuery
		
		if (searchQuery !== "") {
			
			newFilteredPosts = postsQuery?.filter((post:Document<"posts">) => {
				const title = `${post.map} ${post.title} ${post.abilities.map(tag => {return tag.displayText}).join(" ")} ${post.side.displayText}`.replace("_", " ").toUpperCase()  
				
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
	

	function FilteredPosts({postsList}:any) {
		let search = ""
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

		return postsList.map((post: Document<"posts">, index: number) => { 
			return (
			<PostCard
			selected={post._id === currentOpenPost?._id}
			key={index}
			data={post}
			onClick={() => togglePost(post)}/>
		)})
	}

	/* Toggle Post Viewing */
	function togglePost(post:any) {
		if (post._id === currentOpenPost?._id) {
			setCurrentOpenPost(undefined)
		} else {
			setCurrentOpenPost(post)
		}
	}

	return (<div className={"App" + ((currentOpenPost) ? " viewing-post" : "")}>		
		<MobileContext.Provider value={{isMobile: isMobile, windowWidth: windowWidth}}>
			<main className='main-area' tabIndex={-1}>
				<Search onChangeHandler={setSearchQuery}/>
				
				<SortingBar
					floating={!isMobile}
					handleTagClick={handleTagClick}
					handleSelectChange={setSelectedMap}
				/>
				
				<div className="post-grid-wrapper">
					<div className="post-grid">
						<FilteredPosts postsList={filteredPosts}/>
					</div>
				</div>
			</main>
			<PostContext.Provider value={currentOpenPost}>
				{currentOpenPost && (<>
					<PostViewer 
						isActive={currentOpenPost && true}
						togglePostWithId={() => togglePost(currentOpenPost)}
					/>
				</>)}
			</PostContext.Provider>
		</MobileContext.Provider>
	</div>)
}

export default App;