import { faCircleHalfStroke, faCircleXmark, faCrosshairs, faLocationCrosshairs, faMagnifyingGlass, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect,  useState } from "react"
import { useQuery } from "../convex/_generated/react"
import { SelectableTag } from "./Tags"


function Search({onChangeHandler}:any) {

	/* Used to swap out mobile and desktop elements */

    const [isMobile, setIsMobile] = useState(false)
    const [containerWidth, setContainerWidth] = useState(0)

    function getContainerWidth() {
        const {clientWidth: width} = document.body
        return width
    }

    function handleResize() {
        setContainerWidth(getContainerWidth())
        setIsMobile(containerWidth <= 600)
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

	/* =========================================== */

    const [isInputModeNewPost, setIsInputModeNewPost] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    
    let inputPlaceholder = isMobile ? "Search" : "Search or Create a new lineup"

    function onChange(e:any, isSearchBar:boolean) {
        setSearchValue(e.target.value)

        if(isSearchBar) {
            onChangeHandler(e.target.value)
        }
    }
    
    function toggleInputMode(value: boolean) {
        setIsInputModeNewPost(value)

        if (value) {
            onChangeHandler("")
        } else {
            setSearchValue("")
        }
    }

    const tagsQuery = useQuery("tags/getTags")

    const sideTags = tagsQuery?.filter(tag => {
		return tag.category === "sides"
	})

	const abilityTags = tagsQuery?.filter(tag => {
		return tag.category === "abilities"
	})

	return (isInputModeNewPost && !isMobile) ?
    <div className="searchbar new_post">
        <div className="content_input">
            <div className="dynamic-icon" onClick={() => toggleInputMode(false)}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </div>
            <input placeholder="Title" className="title" onChange={(e) => onChange(e, false)} maxLength={64} value={searchValue}/>
            <input placeholder="Enter a message" className="message"/>
        </div>
        <div className="categorisation">
            <div className="section">
                <span className="section_name">
                    <FontAwesomeIcon icon={faLocationCrosshairs}/>
                    Map
                </span>
                <span className="section_content">
                    <select className="map_selector" onChange={() => {}}>
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
                </span>
            </div>
            <div className="section">
                <span className="section_name">
                    <FontAwesomeIcon icon={faCircleHalfStroke}/>
                    Sides
                </span>
                <span className="section_content">
                    {sideTags?.map((tag, index) => {
                        return <SelectableTag key={index} isSmall={false} id={tag.id} onClick={() => {}}/>
                    })}
                </span>
            </div>
            <div className="section">
                <span className="section_name">
                    <FontAwesomeIcon icon={faScrewdriverWrench}/>
                    Ability
                </span>
                <span className="section_content">
                    {abilityTags?.map((tag, index) => {
                        return <SelectableTag key={index} isSmall={false} id={tag.id} onClick={() => {}}/>
                    })}
                </span>
            </div>
        </div>
	</div>
    : <div className="searchbar">
		<div className="dynamic-icon">
		    <FontAwesomeIcon icon={faMagnifyingGlass}/>
		</div>
		<input placeholder={inputPlaceholder} onChange={(e) => onChange(e, true)} value={searchValue}/>
		<button onClick={() => toggleInputMode(true)} ><FontAwesomeIcon icon={faCrosshairs} /> New Lineup</button>
	</div>
}

export default Search