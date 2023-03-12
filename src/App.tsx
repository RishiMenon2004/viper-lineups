import './App.scss';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useQuery } from './convex/_generated/react';

import { Tag } from './components/Tags';
import Search from './components/Search';
import Post from './components/Post';
import SortingBar from './components/SortingBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Document } from './convex/_generated/dataModel';

function App() {

	/* Used to swap out mobile and desktop elements */
	
    const [isMobile, setIsMobile] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)

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

	const [isPostViewOpen, setIsPostViewOpen] = useState(false)
	const [currentOpenPostId, setCurrentOpenPostId] = useState<any>(null)
	const [selectedTags, setSelectedTags] = useState<{abilities: string[], sides: string[]}>({abilities: [], sides: []})
	const [selectedMap, setSelectedMap] = useState("All")
	const [searchQuery, setSearchQuery] = useState("")

	const [startDragMousePosX, setStartDragMousePosX] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [focusedPostTransform, setfocusedPostTransform] = useState("translateX(100%)")
	const [focusedPostTransition, setfocusedPostTransition] = useState("transform 0.25s ease-in-out")

	const postsQuery = useQuery("posts/getFilteredPosts", selectedTags, selectedMap)
	const postsContainer = useRef() as MutableRefObject<HTMLDivElement>
	const focusedPostRef = useRef() as MutableRefObject<HTMLDivElement>

	/* Interrations */

	function handleSelectChange(e:any) {
		setSelectedMap(e.target.value)
	}
	
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

	function onSearchInputChange(value:any) {
		setSearchQuery(value)
	}

	/* Post Components */
	
	let finalPosts:JSX.Element = <></>

	function mapPosts(postsList:any) {
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

		if (postsList !== undefined) {
			if (postsList.length <= 0 ) {
				finalPosts = <div className="fetching-message">{notMatchingMessage}</div>
			} else {
				finalPosts = postsList.map((post: any, index: number) => {
					return <Post key={index} data={post}
						onClick={() => togglePostWithId(post._id.id, post._id)}
					/>
				})
			}
		}  else {
			finalPosts = <div className="fetching-message"><FontAwesomeIcon icon={faSpinner}/> Fetching...</div>
		}
	}
	
	function filterBySearchQuery(filter:string) {
		let filteredPosts = postsQuery

		if (filter !== "") {
			filteredPosts = postsQuery?.filter((post:Document<"posts">) => {
				const title = `${post.map} ${post.title} ${post.tags.join(" ").replace("_", " ")}`.toUpperCase()  
				
				let filterWords = filter.toUpperCase().split(" ")

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
		
		mapPosts(filteredPosts)
	}

	filterBySearchQuery(searchQuery)

	/* Toggle Post Viewing */

	function togglePostWithId(dom_id:any, doc_id:any) {
		
		let posts = postsContainer.current.children
		let currentPost = posts.namedItem(dom_id)

		if (currentPost !== undefined) {
			Array.from(posts).forEach((post) => {
				if (post.classList.contains('selected')) {
					if(post !== currentPost) {
						post.classList.remove('selected')
						setIsPostViewOpen(false)
					}
				}
			})
	
			if (currentPost?.classList.contains('selected')) {
				currentPost.classList.remove('selected')
				setIsPostViewOpen(false)
				setfocusedPostTransform("translateX(100%)")
			} else {
				currentPost?.classList.add('selected')
				setIsPostViewOpen(true)
				setCurrentOpenPostId(doc_id)
				setfocusedPostTransform("translateX(0%)")
			}
		}
	}

	if (currentOpenPostId === null) {
		setCurrentOpenPostId(postsQuery?.at(0)?._id)
	}
	
	let focusedPost = postsQuery?.find((post) => {
		return post._id === currentOpenPostId
	})

	/* Handle Dragging the Focused Post */

	function handlefocusedPostDragStart(xCord: any) {
		setIsDragging(true)
		setfocusedPostTransition("")
		setStartDragMousePosX(xCord)
	}

	function handlefocusedPostDrag(xCord: any) {
		let staringPercent = (startDragMousePosX/windowWidth)*100
		let currentPercent = (xCord/windowWidth)*100

		let percentDelta = Math.max(currentPercent - staringPercent, 0)

		if (isDragging && isMobile) {
			setfocusedPostTransform(`translateX(${percentDelta}%)`)
		}
	}

	function handlefocusedPostDragEnd(xCord: any) {
		if (isDragging && isMobile) {
			setIsDragging(false)
			setfocusedPostTransition("transform 0.25s ease-in-out")

			let staringPercent = (startDragMousePosX/windowWidth)*100
			let currentPercent = (xCord/windowWidth)*100
	
			let percentDelta = currentPercent - staringPercent

			if (percentDelta <= 30) {
				setfocusedPostTransform("translateX(0%)")
			} else {
				setfocusedPostTransform("translateX(100%)")
				togglePostWithId(currentOpenPostId.id, currentOpenPostId)
			}
		}
	}

	function handleTouchStart(e:any) {
		const {clientX} = e.touches[0]
		handlefocusedPostDragStart(clientX)
	}

	function handleTouchMove(e:any) {
		const {clientX} = e.changedTouches[0]
		handlefocusedPostDrag(clientX)
	}

	function handleTouchEnd(e:any) {
		const {clientX} = e.changedTouches[0]
		handlefocusedPostDragEnd(clientX)
	}
 
	return (
		<div className={"App" + ((isPostViewOpen && focusedPost !== undefined) ? " viewing-post" : "")} onMouseMove={({clientX}) => handlefocusedPostDrag(clientX)} onTouchMove={handleTouchMove} onMouseUp={({clientX}) => handlefocusedPostDragEnd(clientX)} onTouchEnd={handleTouchEnd}>
			{!isMobile && <SortingBar floating={true} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
			<main className='main-area' tabIndex={-1}>
				<Search onChangeHandler={onSearchInputChange}/>
				{isMobile && <SortingBar floating={false} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
				<div ref={postsContainer} className="post-grid">
					{finalPosts}
			</div>
			</main>
			{focusedPost !== undefined && (
				<div ref={focusedPostRef} className='view-post' style={isMobile ? {transform: focusedPostTransform, transition: focusedPostTransition} : {}}>
					{isMobile && <div className="drag-region" onMouseDown={({clientX}) => handlefocusedPostDragStart(clientX)} onTouchStart={handleTouchStart}></div>}
					<div className="title" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${focusedPost?.map}.png)`}}>
						<div 
						tabIndex={0} 
						className="close-button" 
						onClick={() => togglePostWithId(focusedPost?._id.id, focusedPost?._id)} 
						onKeyDown={(e) => {
							e.key === "Enter" && togglePostWithId(focusedPost?._id.id, focusedPost?._id)
						}}>
							<FontAwesomeIcon icon={faXmark}/>
						</div>
						{focusedPost?.title}
						<div className='map-name'>{focusedPost?.map}</div>
					</div>
					<div className='tags-container'>
						{focusedPost?.tags.map((tag: string, index: number) => {
							return <Tag key={index} id={tag}/>
						})}
					</div>
				</div>
			)}
		</div>
	)
}

export default App;