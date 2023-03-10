import './App.scss';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useQuery } from './convex/_generated/react';

import { Tag } from './components/Tags';
import Search from './components/Search';
import Post from './components/Post';
import SortingBar from './components/SortingBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';

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

	const postsContainer = useRef() as MutableRefObject<HTMLDivElement>
	const postsQuery = useQuery("posts/getFilteredPosts", selectedTags, selectedMap)

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
		console.log({abilities: abilities, sides: sides})
	}

	function onSearchInputChange(value:any) {
		setSearchQuery(value)
	}

	/* Post Components */
	
	let finalPosts:any
	function mapPosts(postsList:any) {
		if (postsList !== undefined) {
			finalPosts = postsList.map((post: any, index: number) => {
				return <Post key={index} data={post}
					onClick={() => togglePostWithId(post._id.id, post._id)}
				/>
			})
		} else {
			finalPosts = <div className="fetching_message"><FontAwesomeIcon icon={faSpinner}/> Fetching...</div>
		}
	}
	
	function filterBySearchQuery(filter:string) {
		if (filter !== "") {
			let filteredPosts:any = []
			filteredPosts = postsQuery?.filter((post) => {
				const title = `${post.map} ${post.title}`  
				return title.toUpperCase().indexOf(filter.toUpperCase()) > -1
			})
			
			mapPosts(filteredPosts)
		} else {
			mapPosts(postsQuery)
		}
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
			} else {
				currentPost?.classList.add('selected')
				setIsPostViewOpen(true)
				setCurrentOpenPostId(doc_id)
			}
		}
	}

	if (currentOpenPostId === null) {
		setCurrentOpenPostId(postsQuery?.at(0)?._id)
	}
	
	let viewPost = postsQuery?.find((post) => {
		return post._id === currentOpenPostId
	})

	return (
		<div className={"App" + ((isPostViewOpen && viewPost !== undefined) ? " viewing_post" : "")}>
			{!isMobile && <SortingBar floating={true} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
			<main className='main_area' tabIndex={-1}>
				<Search onChangeHandler={onSearchInputChange}/>
				{isMobile && <SortingBar floating={false} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
				<div ref={postsContainer} className="post_grid">
					{finalPosts}
				</div>
			</main>
			{viewPost !== undefined && (
				<div className='view_post'>
					<div className="title" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${viewPost?.map}.png)`}}>
						<div className="close_button" onClick={() => togglePostWithId(viewPost?._id.id, viewPost?._id)}>
							<FontAwesomeIcon icon={faXmark}/>
						</div>
						{viewPost?.title}
						<div className='map_name'>{viewPost?.map}</div>
					</div>
					<div className='tags_container'>
						{viewPost?.tags.map((tag: string, index: number) => {
							return <Tag key={index} id={tag}/>
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;