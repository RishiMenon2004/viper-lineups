import { faCircleHalfStroke, faCircleXmark, faCrosshairs, faLocationCrosshairs, faMagnifyingGlass, faScrewdriverWrench, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect,  useState } from "react"
import { Document } from "../convex/_generated/dataModel"
import { useMutation, useQuery } from "../convex/_generated/react"
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
    const [sidesTagsState, setSidesTagState] = useState({attack: true, defend: false})

    const [searchValue, setSearchValue] = useState("")
    const [messageValue, setMessageValue] = useState("")
    const [selectedTags, setSelectedTags] = useState<{side: string, abilities: string[]}>({side: "attack", abilities: []})
    const [selectedMap, setSelectedMap] = useState("Ascent")

    const tagsQuery = useQuery("tags/getTags")

    const sideTags = tagsQuery?.filter((tag:Document<"tags">) => {
		return tag.category === "sides"
	})

	const abilityTags = tagsQuery?.filter((tag:Document<"tags">) => {
		return tag.category === "abilities"
	})


    function clearFields() {
        setSearchValue("")
        setMessageValue("")
        setSelectedTags({side: "attack", abilities: []})
        setSelectedMap("Ascent")
        setSidesTagState({attack: true, defend: false})
    }

    function toggleInputMode(value: boolean) {
        setIsInputModeNewPost(value)

        if (value) {
            onChangeHandler("")
        } else {
            clearFields()
        }
    }

    function onSearchChange({target}:any, isSearchBar:boolean) {
        setSearchValue(target.value)

        if(isSearchBar) {
            onChangeHandler(target.value)
        }
    }

    useEffect(() => {
        !isInputModeNewPost && onChangeHandler(searchValue)
    },[searchValue, onChangeHandler, isInputModeNewPost])

    function onMessageChange({target}:any) {
        target.style.height = "0px"
        target.style.height = (target.scrollHeight)+"px"
        setMessageValue(target.value)
    }

    function handleTagSelect(tag:string, category:"ability"|"side") {
        let abilities = selectedTags.abilities
		let side = selectedTags.side

        switch(category) {
			case "ability": {
				if (abilities.includes(tag)) {
					let tagIndex = abilities.indexOf(tag)
		
					if (tagIndex > -1) { // only splice array when item is found
						abilities.splice(tagIndex, 1); // 2nd parameter means remove one item only
					}
			
				} else {
					abilities = [...abilities, tag].sort()
				}
				break;
			}

			case "side": {
                let newSidesTagState = sidesTagsState
                
                switch (tag) {
                    case "attack": {
                        newSidesTagState.attack = true
                        newSidesTagState.defend = false
                        break
                    }
                    
                    case "defend": {
                        newSidesTagState.attack = false
                        newSidesTagState.defend = true
                        break
                    }
                }
                
                setSidesTagState(newSidesTagState)
                side = tag
				break;
			}
		}

		setSelectedTags({side: side, abilities: abilities})
    }

    const submitNewPost = useMutation("posts/createNewPost")

    function checkFields() {

        if (searchValue === "") {
            return false
        }

        if (messageValue === "") {
            return false
        }

        if (selectedTags.abilities.length <= 0) {
            return false
        }

        return true
    }

    function handleSubmit() {
        submitNewPost({
            title: searchValue,
            body: messageValue,
            images: [{cover: false, url: ""}],
            tags: [selectedTags.side, ...selectedTags.abilities],
            map: selectedMap
        })

        toggleInputMode(false)
    }

	return (isInputModeNewPost && !isMobile) ?
    <div className="searchbar new-post">
        <div className="content-input">
            <div className="dynamic-icon" onClick={() => toggleInputMode(false)}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </div>
            <input placeholder="Title" className="input title" onChange={(e) => onSearchChange(e, false)} maxLength={64} value={searchValue}/>
            <textarea maxLength={1000} rows={1} onChange={onMessageChange} placeholder="Enter a message" className="input message" value={messageValue}></textarea>
        </div>
        <div className="categorisation">
            <div className="section">
                <div className="section-name">
                    <FontAwesomeIcon icon={faLocationCrosshairs}/>
                    Map
                </div>
                <div className="section-content">
                    <select className="map-selector" value={selectedMap} onChange={({target}:any) => {setSelectedMap(target.value)}}>
                        <option>Ascent</option>
                        <option>Fracture</option>
                        <option>Haven</option>
                        <option>Icebox</option>
                        <option>Lotus</option>
                        <option>Pearl</option>
                        <option>Split</option>
                        <option>Bind</option>
                        <option>Breeze</option>
                    </select>
                </div>
            </div>
            <div className="section">
                <div className="section-name">
                    <FontAwesomeIcon icon={faCircleHalfStroke}/>
                    Sides
                </div>
                <div className="section-content">
                    {sideTags?.map((tag, index) => {
                        let state = tag.id === "attack" ? sidesTagsState.attack : sidesTagsState.defend
                        return <div 
                        key={index} 
                        tabIndex={0} 
                        onClick={() => {handleTagSelect(tag.id, "side")}} 
                        onKeyDown={(e) => {e.key === "Enter" && handleTagSelect(tag.id, "side")}} 
                        className={"tag selectable" + (state ? ' selected' : '')}>
                            <img src={`/tag_icons/${tag.id}.png`} className='icon' alt="tag icon"/>
                            {tag.displayText}
                        </div>
                    })}
                </div>
            </div>
            <div className="section">
                <div className="section-name">
                    <FontAwesomeIcon icon={faScrewdriverWrench}/>
                    Ability
                </div>
                <div className="section-content" tabIndex={-1}>
                    {abilityTags?.map((tag, index) => {
                        return <SelectableTag key={index} isSmall={false} id={tag.id} onClick={() => handleTagSelect(tag.id, "ability")}/>
                    })}
                </div>
            </div>
        </div>
        <div className="form-buttons">
            <button disabled={!checkFields()} onClick={handleSubmit}>Submit</button>
        </div>
        {searchValue}<br/>
        <div style={{whiteSpace: "pre-line"}}>{messageValue}</div><br/>
        {selectedMap}<br/>
        {selectedTags.side}<br/>
        {selectedTags.abilities.map(tag => {
            return tag + ", "
        })}<br/>
	</div>
    : <div className="searchbar">
        <FontAwesomeIcon className="dynamic-icon" icon={faMagnifyingGlass}/>
		<input className="input" placeholder="Search" onChange={(e) => onSearchChange(e, true)} value={searchValue}/>
        {(isMobile && searchValue !== "") && <FontAwesomeIcon className="clear-search-icon" icon={faXmark} onClick={() => setSearchValue("")}/>}
		<button onClick={() => toggleInputMode(true)} ><FontAwesomeIcon icon={faCrosshairs} /> New Lineup</button>
	</div>
}

export default Search