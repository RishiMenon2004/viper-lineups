import { ChangeEvent, ClipboardEvent, Dispatch, DragEvent, SetStateAction, useContext, useEffect,  useRef,  useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Infer } from "convex/values"
import { postSchema } from "../../convex/schema"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { 
    faCheckCircle, 
    faCircleHalfStroke, 
    faCircleXmark, 
    faCrosshairs, 
    faFileArrowDown, 
    faImage, 
    faImages, 
    faLocationCrosshairs, 
    faMagnifyingGlass, 
    faPlus, 
    faScrewdriverWrench, 
    faSpinner, 
    faTrash, 
    faXmark 
} from "@fortawesome/free-solid-svg-icons"

import { TagObject, SideTags, AbilityTags, Tag } from "./Tags"
import {  } from "./Tags/tagObject"

import { MobileContext } from "../App"
import { Id } from "../../convex/_generated/dataModel"

function Search({onChangeHandler}:{onChangeHandler: Dispatch<SetStateAction<string>>}) {

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
    const [selectedImages, setSelectedImages] = useState<{cover: boolean, url: string, uploading?: boolean, data: Blob, uploaded?: boolean}[]>([])
    const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false)

    /* Toggle Searchbar/New Post */
    function toggleInputMode(value: boolean) {
        setIsInputModeNewPost(value)

        if (value) {
            onChangeHandler("")
        } else {
            clearFields()
        }
    }

    /* =========================================== */

    /* Clear Form Fields */
    function clearFields() {
        setSearchValue("")
        setMessageValue("")
        setSelectedTags({side: defaultSideTag, abilities: []})
        setSelectedMap("Ascent")
        setSelectedSideIndex(0)
        setSelectedImages(oldValue => oldValue.filter((oldImage) => {
            URL.revokeObjectURL(oldImage.url)
            return false
        }))
    }

    /* Validate Form Fields */
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

    /* Get the mutation function to create the new post */
    const submitNewPost = useMutation(api.post.createNewPost)
    
    /* Submit Handler */
    async function handleSubmit() {
        const imagesData: {
            url?: string | undefined;
            cover: boolean;
            storageId: Id<"_storage">;
        }[] = []

        setIsInputDisabled(true)
        
        const uploadingImages = [...selectedImages]
        setSelectedImages(oldValue => oldValue.map((image) => {
            image = {
                ...image,
                uploading: true
            }
            
            return image
        }))

        for (const [imageIndex, selectedImage] of uploadingImages.entries()) {
            await uploadImage(selectedImage.data, imageIndex).then(storageId => {
                const uploadedImage = {
                    cover: selectedImage.cover,
                    storageId: storageId
                }
    
                imagesData.push(uploadedImage)
            })
        }
        
        const data: Infer<typeof postSchema> = {
            title: searchValue,
            body: messageValue,
            images: [...imagesData],
            side: selectedTags.side,
            abilities: [...selectedTags.abilities],
            map: selectedMap
        }

        await submitNewPost({ post: data })

        setIsInputDisabled(false)
        toggleInputMode(false)
    }

    /* =========================================== */

    /* Search/Title Field */

    function onSearchChange({target}: ChangeEvent<HTMLInputElement>, isSearchBar:boolean) {
        setSearchValue(target.value)

        if(isSearchBar) {
            onChangeHandler(target.value)
        }
    }

    useEffect(() => {
        !isInputModeNewPost && onChangeHandler(searchValue)
    },[searchValue, onChangeHandler, isInputModeNewPost])

    /* Post Body Field */

    function onMessageChange({target}: ChangeEvent<HTMLTextAreaElement>) {
        target.style.height = "0px"
        target.style.height = `${target.scrollHeight}px`
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

    async function getResizedImage(file: Blob, width?:number, height?:number, quality = 0.6) {
        return new Promise<Blob>((resolve) => {
            const image = new Image()
            image.src = URL.createObjectURL(file)
            image.onload = () => {
                const imageWidth = image.width
                const imageHeight = image.height
                const canvas = document.createElement('canvas')

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

                const ctx = canvas.getContext("2d")
                ctx !== null && ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

                canvas.toBlob((blob) => {
                    if (blob !== null) {
                        const file = new File([blob], "fileName.jpg", { type: "image/jpeg" })
                        resolve(file)
                    }
                }, "image/jpeg", quality)
            }
        })
    }

    async function selectImage(image: Blob) {

        //compress the image because i don't want to pay for convex file serving
        const compressedImage: Blob = await getResizedImage(image).then(file => {
            return file
        })
        const dataUrl = URL.createObjectURL(compressedImage)
        //add new item to state
        setSelectedImages(oldValue => {
            return [...oldValue, {
                uploading: false,
                cover: oldValue.length === 0, 
                data: compressedImage,
                url: dataUrl,
                index: oldValue.length - 1
            }]
        })
    }

    async function getImagesFromFiles(fileObj: FileList, single?: boolean) {
        const filesLength = single ? 1 : fileObj.length
        
        for (let i = 0; i < filesLength; i++) {
            let blob: File | null = null
            
            if (fileObj.item(i)?.type.indexOf("image") === 0) {
                blob = fileObj.item(i)
            }
            
            if (blob !== null) {
                await selectImage(blob)
            }
        }
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    async function getFilesFromFileSelect(event: ChangeEvent<HTMLInputElement>) {

        const fileObj = event.target.files
        if (!fileObj) {
            return
        }
        event.target.files = null

        await getImagesFromFiles(fileObj)
    }

    async function getFilesFromDrag(event: DragEvent<HTMLDivElement>) {
        const fileObj = event.dataTransfer.files
        if (!fileObj) {
            return
        }

        await getImagesFromFiles(fileObj)
    }

    async function getFilesFromClipboard(event: ClipboardEvent<HTMLDivElement>) {
        const fileObj = (event.clipboardData).files
        if (!fileObj) {
            return
        }

        await getImagesFromFiles(fileObj, true)
    }

    function setAsCover(index: number) {
        setSelectedImages(oldValue => oldValue.map((oldImage, oldImageIndex) => {

            oldImage = {
                ...oldImage,
                cover: oldImageIndex === index
            }
            return oldImage

        }))
    }

    /* Uploading File to Storage and DB */

    const generateUploadUrl = useMutation(api.image.generateUploadUrl)

    async function postImage(image: Blob): Promise<Id<"_storage">> {

        const postUrl = await generateUploadUrl()
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
        })

        const { storageId } = await result.json() as { storageId: Id<"_storage"> }

        return storageId
    }

    async function uploadImage(data: Blob, imageIndex:number) {
        //upload image to file storage and get storageID
        const storageId = await postImage(data)

        //modify item with new data
        setSelectedImages(oldValue => oldValue.map((image, index) => {
            if (imageIndex === index) {
                image = {
                    ...image,
                    uploading: false,
                    uploaded: true
                }
            }
            
            return image
        }))

        //return storageId so it can be used when submitting the form
        return storageId
    }

    /* File Deletion */

    function deleteAllImages() {
        for (const image of selectedImages) {
            handleDeleteImage(image)
        }
    }

    function handleDeleteImage(image:{cover: boolean, url: string, uploading?: boolean, data: Blob, uploaded?: boolean}) {
        setSelectedImages(oldValue => {
            const newValue = oldValue.filter((selectedImage) => {
                if (selectedImage === image) {
                    URL.revokeObjectURL(selectedImage.url)
                    return false
                } else {
                    return true
                }
            })

            return newValue
        })
    }

    /* Rendering */

    function UploadImageButton() {
        return <div className={"upload-button" + (isInputDisabled ? " disabled" : "")} onClick={() => fileInputRef?.current?.click()}>
            <input 
            ref={fileInputRef}
            style={{display: "none"}} 
            type={"file"}
            onChange={(e) => void getFilesFromFileSelect(e)}
            multiple={true}
            disabled={isInputDisabled}
            />
            <FontAwesomeIcon className="upload-button-icon" icon={faImage}/>
            <FontAwesomeIcon className="upload-button-plus" icon={faPlus}/>
        </div>
    }

    function ImagePreview({image, index}: {image: {
        cover: boolean;
        url: string;
        uploading?: boolean | undefined;
        data: Blob;
        uploaded?: boolean | undefined;
    }, index: number}) {
        const [mouseEvents, setMouseEvents] = useState(true)

        let imageStatusContent = <FontAwesomeIcon onMouseEnter={() => setMouseEvents(false)} onMouseLeave={() => setMouseEvents(true)} className="delete-button" onClick={() => handleDeleteImage(image)} icon={faTrash}/>

        if (image.uploading) {
                imageStatusContent = <div className="status-overlay">
                    <FontAwesomeIcon icon={faSpinner} spinPulse/>
                </div>
        }

        if (image.uploaded) {
               imageStatusContent = <div className="status-overlay">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                </div>
        }

        return <div className="image" onClick={() => mouseEvents && setAsCover(index)} style={{backgroundImage: `url(${image.url})`}}>
            {image.cover && (
                <div className="cover-icon">
                    <FontAwesomeIcon icon={faCheckCircle}/>
                </div>
            )}
            {imageStatusContent}
        </div>
    }

    const imagePreviews = selectedImages.map((image, index) => {
        return <ImagePreview key={index} image={image} index={index}/>
    })

    const [isFileDragOver, setIsFileDragOver] = useState(false)

    function ImageUpload() {

        const [dragOverIcon, setDragOverIcon] = useState(faFileArrowDown)

        function handleDragOver(event: DragEvent<HTMLDivElement>) {
            event.preventDefault()

            if (event.dataTransfer.items.length <= 1) {
                setDragOverIcon(faImage)
            } else {
                setDragOverIcon(faImages)
            }
            setIsFileDragOver(true)
        }
        
        async function handleDrop(event: DragEvent<HTMLDivElement>) {
            event.preventDefault()
            setIsFileDragOver(false)
            await getFilesFromDrag(event)
        }

        return <div className={`upload-input ${isFileDragOver ? "drag-over" : ""}`} onDrop={(e) => void handleDrop(e)} onDragOver={(e) => handleDragOver(e)} onDragExit={() => setIsFileDragOver(false)}>
            <div className="image-grid">
                <UploadImageButton/>
                {imagePreviews}
            </div>
            <div className="drag-over-image">
                <FontAwesomeIcon icon={dragOverIcon}/>
            </div>
        </div>
    }

	if (isInputModeNewPost && !isMobile) { return ( 
        <div className="searchbar new-post" onPaste={(e) => void getFilesFromClipboard(e)}>

            <div className="content-input">
                <div className="dynamic-icon" onClick={() => toggleInputMode(false)}>
                    <FontAwesomeIcon icon={faCircleXmark}/>
                </div>
                
                <input className="input title" placeholder="Title" maxLength={64}
                onChange={(e) => onSearchChange(e, false)}
                // onPaste={getFilesFromClipboard}
                value={searchValue}
                disabled={isInputDisabled}
                />

                <textarea className="input message" placeholder="Enter a message"
                maxLength={500} rows={1}
                onChange={(e) => void onMessageChange(e)}
                // onPaste={getFilesFromClipboard}
                value={messageValue}
                disabled={isInputDisabled}
                />
            </div>
            
            <ImageUpload/>
            
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
                            return <Tag
                                key={index}
                                tag={tag}
                                selectable
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
                            return <Tag
                                key={index}
                                tag={tag}
                                selectable
                                onClick={() => handleTagSelect(tag, "ability")}
                            />
                        })}
                    </div>
                </div>
            </div>
            
            <div className="form-buttons">
                {selectedImages.length > 1 && <button className="button red" onClick={deleteAllImages}>Delete All Images</button>}
                <button className="button green" disabled={!checkFields()} onClick={() => void handleSubmit()}>Submit</button>
            </div>
        </div>

    )} else { return (
        <div className="searchbar">

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
            
            <button className="button green new-post-button" onClick={() => toggleInputMode(true)} >
                <FontAwesomeIcon icon={faCrosshairs} /> New Lineup
            </button>
        </div>
    )}
}

export default Search
