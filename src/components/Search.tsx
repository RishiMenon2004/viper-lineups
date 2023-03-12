import { 
    faCheckCircle, 
    faCircleHalfStroke, 
    faCircleXmark, 
    faCrosshairs, 
    faImage, 
    faLocationCrosshairs, 
    faMagnifyingGlass, 
    faPlus, 
    faScrewdriverWrench, 
    faSpinner, 
    faTrash, 
    faXmark 
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect,  useRef,  useState } from "react"
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

	/* =========================================== */

    const [isInputModeNewPost, setIsInputModeNewPost] = useState(false)
    const [sidesTagsState, setSidesTagState] = useState({attack: true, defend: false})

    const [searchValue, setSearchValue] = useState("")
    const [messageValue, setMessageValue] = useState("")
    const [selectedTags, setSelectedTags] = useState<{side: string, abilities: string[]}>({side: "attack", abilities: []})
    const [selectedMap, setSelectedMap] = useState("Ascent")
    const [uploadedImages, setUploadedImages] = useState<{cover?: boolean, url?: any, storageId?: any, uploading?: boolean}[]>([])
    const [isUploadOnTimeout, setIsUploadOnTimeout] = useState(false)

    /* Searchbar/New Post Function */

    function toggleInputMode(value: boolean, onSubmit:boolean) {
        setIsInputModeNewPost(value)

        if (value) {
            onChangeHandler("")
        } else {
            clearFields(onSubmit)
        }
    }

    /* =========================================== */

    /* Form Handling */

    function clearFields(onSubmit:boolean) {
        setSearchValue("")
        setMessageValue("")
        setSelectedTags({side: "attack", abilities: []})
        setSelectedMap("Ascent")
        setSidesTagState({attack: true, defend: false})
        
        if (!onSubmit) uploadedImages.forEach(async (image) => {
            await deleteImage(image.storageId)
        })

        setUploadedImages([])
        setIsUploadOnTimeout(false)
    }

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

        if (uploadedImages.length > 0){
            let hasCover = false

            uploadedImages.every(image => {
                if (image.cover) {
                    hasCover = true
                    return false
                }

                return true
            })

            if (hasCover === false) {
                return false
            }

            let hasUploading = false

            uploadedImages.every(image => {
                if (image.uploading) {
                    hasUploading = true
                    return false
                }

                return true
            })

            if (hasUploading) {
                return false
            }
        } else {
            return false
        }

        return true
    }

    const submitNewPost = useMutation("posts/createNewPost")
    const imagesQuery = useQuery("posts/getImages:getAllImages")

    async function handleSubmit() {

        let imagesData:{cover: boolean, url: string}[] = []

        uploadedImages.forEach((selectedImage:any) => {
            let imageDocument = imagesQuery?.find(image => {
                return image.storageId === selectedImage.storageId
            })

            imageDocument !== undefined && imagesData.push({cover: selectedImage.cover, url: imageDocument.downloadUrl})
        })
        
        const data = {
            title: searchValue,
            body: messageValue,
            images: [...imagesData],
            tags: [selectedTags.side, ...selectedTags.abilities],
            map: selectedMap
        }
        
        await submitNewPost(data)

        // clearFields(true)
        toggleInputMode(false, true)
    }

    /* =========================================== */

    /* Search/Title Field */

    function onSearchChange({target}:any, isSearchBar:boolean) {
        setSearchValue(target.value)

        if(isSearchBar) {
            onChangeHandler(target.value)
        }
    }

    useEffect(() => {
        !isInputModeNewPost && onChangeHandler(searchValue)
    },[searchValue, onChangeHandler, isInputModeNewPost])

    /* Post Body Field */

    function onMessageChange({target}:any) {
        target.style.height = "0px"
        target.style.height = (target.scrollHeight)+"px"
        setMessageValue(target.value)
    }

    /* Tags Selection */

    const tagsQuery = useQuery("tags/getTags")

    const sideTags = tagsQuery?.filter((tag:Document<"tags">) => {
		return tag.category === "sides"
	})

	const abilityTags = tagsQuery?.filter((tag:Document<"tags">) => {
		return tag.category === "abilities"
	})

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

    /* File Upload Handling */

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    function handleFileChange(event:any) {

        const fileObj = event.target.files
        if (!fileObj) {
            return
        }

        event.target.files = null

        for (let i = 0; i < fileObj.length; i++) {
            let blob:any = null
            
            if (fileObj[i].type.indexOf("image") === 0) {
                blob = fileObj[i]
            }
            
            if (blob !== null) {
                let reader = new FileReader()
                reader.onload = async function(event) {
                    await uploadImage(blob, event.target?.result)
                }
                reader.readAsDataURL(blob)
            }
        }

    }

    function getImageFromClipboard(event:any) {
        if (!isUploadOnTimeout) {
            // use event.originalEvent.clipboard for newer chrome versions
            let items = (event.clipboardData || event.originalEvent.clipboardData).items

            // find pasted image among pasted items
            let blob:any = null
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") === 0) {
                    blob = items[i].getAsFile()
                }
            }

            if (blob !== null) {
                let reader = new FileReader()
                reader.onload = async function(event) {
                    uploadImage(blob, event.target?.result)
                }
                reader.readAsDataURL(blob)
            }

            // load image if there is a pasted image
            
        }
    }

    /* Uploading File to Storage and DB */

    const generateUploadUrl = useMutation("posts/uploadImage:generateUploadUrl")
    const sendImage = useMutation("posts/uploadImage:sendImage")

    async function postImage(image:any) {

        const postUrl = await generateUploadUrl()
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
        })

        const { storageId } = await result.json()

        await sendImage(storageId)

        return storageId
    }

    async function uploadImage(data:any, preview:any) {
        let newSelectedImages = uploadedImages

        let newImage = {
            uploading: true
        }

        let isCover = newSelectedImages.length === 0
        
        newSelectedImages.push(newImage)
        setUploadedImages([...newSelectedImages])

        setIsUploadOnTimeout(true)
        //upload image to file storage
        const storageId = await postImage(data)

        //add the image to state after uploading
        newSelectedImages[newSelectedImages.indexOf(newImage)] = {
            cover: isCover, 
            url: preview,
            storageId: storageId
        }

        setUploadedImages([...newSelectedImages])

        setIsUploadOnTimeout(false)
    }

    /* function deleteAllImages() {
        if (imagesQuery !== undefined) {
            for (const image of imagesQuery) {
                deleteImage(image.storageId)
            }
        }
        setUploadedImages([])
    } */

    function setAsCover(image: any) {
        let newSelectedImages = uploadedImages

        for (const image of newSelectedImages) {
            image.cover = false
        }
        
        let index = newSelectedImages.indexOf(image)
        
        if (index > -1) {
            newSelectedImages[index].cover = true
        }

        setUploadedImages([...newSelectedImages])
    }

    /* File Deletion */

    const deleteImage = useMutation("posts/deleteImage")

    function handleDeleteImage(image:any) {

        let newSelectedImages = uploadedImages

        const index = newSelectedImages.indexOf(image)

        if (index > -1) {
            newSelectedImages.splice(index, 1)
        }

        setUploadedImages([...newSelectedImages])

        deleteImage(image.storageId)

        setIsUploadOnTimeout(false)
    }

    /* Rendering */

    function ImagePreview({image}: any) {
        const [mouseEvents, setMouseEvents] = useState(true)
        return image.uploading ? 
        <div className="image">
            <FontAwesomeIcon icon={faSpinner}/>
        </div> 
        : <div className="image" onClick={() => mouseEvents && setAsCover(image)} style={{backgroundImage: `url(${image.url})`}}>
            {image.cover && <div className="cover-icon">
                <FontAwesomeIcon icon={faCheckCircle}/>
            </div>}
            <FontAwesomeIcon onMouseEnter={() => setMouseEvents(false)} onMouseLeave={() => setMouseEvents(true)} className="delete-button" onClick={() => handleDeleteImage(image)} icon={faTrash}/>
        </div>
    }

    const imagePreviews = uploadedImages?.map((image:any, index:number) => {
        return <ImagePreview key={index} image={image}/>
    })

	return (isInputModeNewPost && !isMobile) ?
    <div className="searchbar new-post">

        <div className="content-input">
            <div className="dynamic-icon" onClick={() => toggleInputMode(false, false)}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </div>
            
            <input className="input title" placeholder="Title" maxLength={64}
            onChange={(e) => onSearchChange(e, false)}
            onPaste={getImageFromClipboard}
            value={searchValue}/>

            <textarea className="input message" placeholder="Enter a message"
            maxLength={1000} rows={1}
            onPaste={getImageFromClipboard}
            onChange={onMessageChange}
            value={messageValue}/>
        </div>
        
        <div className="upload-input">
            <input 
            ref={fileInputRef}
            style={{display: "none"}} 
            type={"file"}
            onChange={handleFileChange} multiple={true}/>
            
            <div className="image-grid">

                <div className="upload-button" onClick={() => fileInputRef?.current?.click()}>
                    <FontAwesomeIcon className="upload-button-icon" icon={faImage}/>
                    <FontAwesomeIcon className="upload-button-plus" icon={faPlus}/>
                </div>
                
                {imagePreviews}
            </div>
        </div>
        
        <div className="categorisation">
            <div className="section">

                <div className="section-name">
                    <FontAwesomeIcon icon={faLocationCrosshairs}/>
                    Map
                </div>
                
                <div className="section-content">
                    <select 
                    className="map-selector"
                    value={selectedMap}
                    onChange={({target}:any) => {setSelectedMap(target.value)}}>
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
                        return <SelectableTag
                        key={index}
                        isSmall={false}
                        id={tag.id}
                        onClick={() => handleTagSelect(tag.id, "ability")}/>
                    })}
                </div>
            </div>
        </div>
        
        <div className="form-buttons">
            <button disabled={!checkFields()} onClick={handleSubmit}>Submit</button>
            {/* <button onClick={deleteAllImages}>Delete All Images</button> */}
        </div>
	</div>
    
    : <div className="searchbar">

        <FontAwesomeIcon className="dynamic-icon" icon={faMagnifyingGlass}/>
		
        <input className="input" placeholder="Search"
        onChange={(e) => onSearchChange(e, true)}
        value={searchValue}/>
        
        {(isMobile && searchValue !== "") && (
            <FontAwesomeIcon
            className="clear-search-icon"
            icon={faXmark}
            onClick={() => setSearchValue("")}/>
        )}
		
        <button onClick={() => toggleInputMode(true, false)} >
            <FontAwesomeIcon icon={faCrosshairs} /> New Lineup
        </button>
	</div>
}

export default Search