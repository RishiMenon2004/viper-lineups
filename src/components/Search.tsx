import { ChangeEvent, useContext, useEffect,  useRef,  useState } from "react"
import { useMutation } from "../convex/_generated/react"
import { Infer } from "convex/schema"
import { postSchema } from "../convex/schema"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

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

import { SelectableTag } from "./Tags"
import { TagObject, SideTags, AbilityTags } from "./Tags/tagObject"

import { MobileContext } from "../App"

function Search({onChangeHandler}:any) {

	/* Used to swap out mobile and desktop elements */

    const {isMobile} = useContext(MobileContext)

	/* =========================================== */

    const defaultSideTag = SideTags.find(tag => tag.id === "attack") as TagObject

    const [isInputModeNewPost, setIsInputModeNewPost] = useState(false)
	const [selectedSideIndex, setSelectedSideIndex] = useState<number>(0)

    const [searchValue, setSearchValue] = useState("")
    const [messageValue, setMessageValue] = useState("")
    const [selectedTags, setSelectedTags] = useState<{side: TagObject, abilities: TagObject[]}>({side: defaultSideTag, abilities: []})
    const [selectedMap, setSelectedMap] = useState("Ascent")
    const [selectedImages, setSelectedImages] = useState<{cover: boolean, url: any, uploading?: boolean, data: any, uploaded?: boolean}[]>([])
    const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false)

    /* Searchbar/New Post Function */

    function toggleInputMode(value: boolean) {
        setIsInputModeNewPost(value)

        if (value) {
            onChangeHandler("")
        } else {
            clearFields()
        }
    }

    /* =========================================== */

    /* Form Handling */

    function clearFields() {
        setSearchValue("")
        setMessageValue("")
        setSelectedTags({side: defaultSideTag, abilities: []})
        setSelectedMap("Ascent")
        setSelectedSideIndex(0)
        setSelectedImages([])
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

        if (selectedImages.length > 0){
            let hasCover = false

            selectedImages.every(image => {
                if (image.cover) {
                    hasCover = true
                    return false
                }

                return true
            })

            if (hasCover === false) {
                return false
            }
        } else {
            return false
        }

        return true
    }

    const submitNewPost = useMutation("post:createNewPost")

    async function handleSubmit() {

        let imagesData = []

        setIsInputDisabled(true)
        
        const uploadingImages = [...selectedImages]
        setSelectedImages(oldValue => oldValue.map((image) => {
            image = {
                ...image,
                uploading: true
            }
            
            return image
        }))

        for(const imageIndex in uploadingImages) {
            let selectedImage = uploadingImages[imageIndex]

            const storageId = await uploadImage(selectedImage.data, parseInt(imageIndex))

            let uploadedImage = {
                cover: selectedImage.cover,
                storageId: storageId
            }

            imagesData.push(uploadedImage)
        }
        
        const data: Infer<typeof postSchema> = {
            title: searchValue,
            body: messageValue,
            images: [...imagesData],
            side: selectedTags.side,
            abilities: [...selectedTags.abilities],
            map: selectedMap
        }

        await submitNewPost(data)

        setIsInputDisabled(false)
        toggleInputMode(false)
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

    const sideTags = SideTags

	const abilityTags = AbilityTags

    function handleTagSelect(tag:TagObject, category: "ability" | "side") {
        let abilities = selectedTags.abilities
		let side = selectedTags.side

        if(category === "ability") {
            if (abilities.includes(tag)) {
                abilities = abilities.filter(abilityTag => {
                    return abilityTag !== tag
                })
			
            } else {
                abilities = [...abilities, tag].sort()
            }
		} else {
            side = tag
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
                    selectImage(blob, event.target?.result)
                }
                reader.readAsDataURL(blob)
            }
        }

    }

    function getImageFromClipboard(event:any) {
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
            reader.onload = function(event) {
                selectImage(blob, event.target?.result)
            }
            reader.readAsDataURL(blob)
        }
    }

    /* Uploading File to Storage and DB */

    const generateUploadUrl = useMutation("image:generateUploadUrl")

    async function postImage(image:any) {

        const postUrl = await generateUploadUrl()
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
        })

        const { storageId } = await result.json()

        return storageId
    }

    function selectImage(data: any, preview:any) {
        //add new item to state
        setSelectedImages(oldValue => {
            return [...oldValue, {
                uploading: false,
                cover: oldValue.length === 0, 
                url: preview,
                data: data
            }]
        })
    }

    async function getResizedImage(file:any, width?:number, height?:number, quality:number = 0.6) {
        return new Promise((resolve) => {
            let image = new Image()
            image.src = URL.createObjectURL(file)
            image.onload = _ => {
                let imageWidth = image.width
                let imageHeight = image.height
                let canvas = document.createElement('canvas')

                // resize the canvas and draw the image data into it
                if (width && height) {
                    canvas.width = width
                    canvas.height = height
                } else if (width) {
                    canvas.width = width;
                    canvas.height = Math.floor(imageHeight * width / imageWidth)
                } else if (height) {
                    canvas.width = Math.floor(imageWidth * height / imageHeight);
                    canvas.height = height
                } else {
                    canvas.width = imageWidth
                    canvas.height = imageHeight
                }

                let ctx = canvas.getContext("2d")
                ctx !== null && ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

                canvas.toBlob((blob) => {
                    if (blob !== null) {
                        let file = new File([blob], "fileName.jpg", { type: "image/jpeg" })
                        resolve(file)
                    }
                  }, "image/jpeg", quality)
            }
        }).then(file => {
            return file
        })
    }

    async function uploadImage(data: any, imageIndex:number) {
        //compress the image because i don't want to pay for convex file serving
        const compressedData = await getResizedImage(data)
        
        //upload image to file storage and get storageID
        const storageId = await postImage(compressedData)

        //modify item with new data
        setSelectedImages(oldValue => oldValue.map((image, index) => {
            if (imageIndex === index) {
                image = {
                    ...image,
                    uploading: false,
                    uploaded: false
                }
            }
            
            return image
        }))

        //return storageId so it can be used when submitting the form
        return storageId
    }

    /* function deleteAllImages() {
        if (imagesQuery !== undefined) {
            for (const image of imagesQuery) {
                // if (uploadedImages.find(uploadedImage =>  {return uploadedImage.storageId === image.storageId}) !== undefined) {
                    deleteImage(image.storageId)
                // }
            }
        }
        setUploadedImages([])
    } */

    function setAsCover(image: any) {
        setSelectedImages(oldValue => oldValue.map(oldImage => {
            oldImage = {
                ...oldImage,
                cover: true
            }

            if (oldImage.data !== image.data) {
                oldImage = {
                    ...oldImage,
                    cover: false
                }
            }

            return oldImage

        }))
    }

    /* File Deletion */

    function handleDeleteImage(image:any) {
        setSelectedImages(oldValue => {
            let isCoverDeleted = false

            let newValue = oldValue.filter((selectedImage) => {
                if (selectedImage === image) {
                    if (selectedImage.cover) {
                        isCoverDeleted = true
                    }
                    return false
                } else {
                    return true
                }
            })

            if (isCoverDeleted) {
                newValue = newValue.map((selectedImage, index) => {
                    if (index === 0) {
                        selectedImage = {
                            ...selectedImage,
                            cover: true
                        }
                    } 

                    return selectedImage
                })
            }

            return newValue
        })
    }

    /* Rendering */

    function ImagePreview({image}: any) {
        const [mouseEvents, setMouseEvents] = useState(true)

        if (image.uploading) { return (
            <div className="image" style={{backgroundImage: `url(${image.url})`}}>
                <div className="spinner">
                    <FontAwesomeIcon className="spinner-icon" icon={faSpinner}/>
                </div>
            </div>
        )}

        if (image.uploaded) {return (
            <div className="image" style={{backgroundImage: `url(${image.url})`}}>
                <div className="spinner">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                </div>
            </div>
        )}

        return <div className="image" onClick={() => mouseEvents && setAsCover(image)} style={{backgroundImage: `url(${image.url})`}}>
            {image.cover && (
                <div className="cover-icon">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                </div>
            )}
            <FontAwesomeIcon onMouseEnter={() => setMouseEvents(false)} onMouseLeave={() => setMouseEvents(true)} className="delete-button" onClick={() => handleDeleteImage(image)} icon={faTrash}/>
        </div>
    }

    const imagePreviews = selectedImages.map((image, index) => {
        return <ImagePreview key={index} image={image}/>
    })

    function UploadImageButton() {
        return <div className={"upload-button" + (isInputDisabled ? " disabled" : "")} onClick={() => fileInputRef?.current?.click()}>
            <input 
            ref={fileInputRef}
            style={{display: "none"}} 
            type={"file"}
            onChange={handleFileChange}
            multiple={true}
            disabled={isInputDisabled}
            />
            <FontAwesomeIcon className="upload-button-icon" icon={faImage}/>
            <FontAwesomeIcon className="upload-button-plus" icon={faPlus}/>
        </div>
    } 

	return (isInputModeNewPost && !isMobile) ?
    <div className="searchbar new-post">

        <div className="content-input">
            <div className="dynamic-icon" onClick={() => toggleInputMode(false)}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </div>
            
            <input className="input title" placeholder="Title" maxLength={64}
            onChange={(e) => onSearchChange(e, false)}
            onPaste={getImageFromClipboard}
            value={searchValue}
            disabled={isInputDisabled}
            />

            <textarea className="input message" placeholder="Enter a message"
            maxLength={500} rows={1}
            onPaste={getImageFromClipboard}
            onChange={onMessageChange}
            value={messageValue}
            disabled={isInputDisabled}
            />
        </div>
        
        <div className="upload-input">
            <div className="image-grid">
                <UploadImageButton/>
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
                    onChange={({target}:ChangeEvent<HTMLSelectElement>) => {setSelectedMap(target.value)}}>
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
                    {sideTags.map((tag, index) => {
                        return <SelectableTag
                            key={index}
                            tag={tag}
                            isSelected={selectedSideIndex === index}
                            onClick={() => {
                                setSelectedSideIndex(index)
                                handleTagSelect(tag, "side")
                            }}
                        />
                    })}
                </div>
            </div>
            
            <div className="section">
                
                <div className="section-name">
                    <FontAwesomeIcon icon={faScrewdriverWrench}/>
                    Ability
                </div>
                
                <div className="section-content" tabIndex={-1}>
                    {abilityTags.map((tag, index) => {
                        return <SelectableTag
                            key={index}
                            tag={tag}
                            onClick={() => handleTagSelect(tag, "ability")}
                        />
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
		
        <button onClick={() => toggleInputMode(true)} >
            <FontAwesomeIcon icon={faCrosshairs} /> New Lineup
        </button>
	</div>
}

export default Search