import { faCircleXmark, faCrosshairs, faLocationCrosshairs, faMagnifyingGlass, faTag } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react"
import { useQuery } from "../convex/_generated/react"
import { SelectableTag } from "./Tags"


function Search() {

    const [isMobile, setIsMobile] = useState(false)
    const [containerWidth, setContainerWidth] = useState(0)
    const [isInputModeNewPost, setIsInputModeNewPost] = useState(false)

	const searchbox:any = useRef()

	const getContainerWidth = () => {
        const {clientWidth: width} = document.body
        return width
    }

    const handleResize = () => {
        setContainerWidth(getContainerWidth())
        setIsMobile(containerWidth <= 600)
    }

    const setInputModeNewPost = () => {
        setIsInputModeNewPost(true)
    }

    const setInputModeSearch = () => {
        setIsInputModeNewPost(false)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

    useEffect(() => {
        if (isMobile) {
            setIsInputModeNewPost(false)
        }        
    }, [isMobile])

    const tagsQuery = useQuery("tags/getTags")

	let inputPlaceholder = isMobile ? "Search" : "Search or Create a new lineup"

	return (isInputModeNewPost && !isMobile) ?
    <div ref={searchbox} className="searchbar new_post">
        <div className="content_input">
            <div className="dynamic-icon" onClick={setInputModeSearch}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </div>
            <input placeholder="Title" className="title"/>
            <input placeholder="Enter a message" className="message"/>
        </div>
        <div className="categorisation">
            <div className="map_select">
                <FontAwesomeIcon icon={faLocationCrosshairs}/>
                <select onChange={() => {}}>
                    <option value={"ascent"}>Ascent</option>
                    <option value={"fracture"}>Fracture</option>
                    <option value={"haven"}>Haven</option>
                    <option value={"icebox"}>Icebox</option>
                    <option value={"lotus"}>Lotus</option>
                    <option value={"pearl"}>Pearl</option>
                    <option value={"split"}>Split</option>
                    <option value={"bind"}>Bind</option>
                    <option value={"breeze"}>Breeze</option>
                </select>
            </div>
            <div className="tags_container">
                <FontAwesomeIcon icon={faTag}/>
                {tagsQuery?.map((tag, index) => {
                    return <SelectableTag isSmall={false} key="index" id={tag.id} onClick={() => {}}/>
                })}
            </div>
        </div>
	</div>
    : <div ref={searchbox} className="searchbar">
		<div className="dynamic-icon">
		    <FontAwesomeIcon icon={faMagnifyingGlass}/>
		</div>
		<input placeholder={inputPlaceholder}/>
		<button onClick={setInputModeNewPost} ><FontAwesomeIcon icon={faCrosshairs} /> New Lineup</button>
	</div>
}

export default Search