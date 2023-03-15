import { useContext, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretLeft, faCaretRight, faXmark } from "@fortawesome/free-solid-svg-icons"

import { MobileContext } from "../App"
function ImageViewer({
	openImageIndexState,
	images,
}:{
	openImageIndexState: [number, Function],
	images: {
		cover: boolean,
		storageId: string,
		url?: string
	}[]
}) {

	const {isMobile, windowWidth} = useContext(MobileContext)
	const [openImageIndex, setOpenImageIndex] = openImageIndexState

	/* Handle Image Viewing: Zoom, Inspecting */

	const [viewImagePos, setViewImagePos] = useState({x: 0, y: 0})
	const [viewImageDragStartPos, setViewImageDragStartPos] = useState<{x: number, y: number}>({x: 0, y:0})
	const [viewImageDragOffset, setViewImageDragOffset] = useState<{x: number, y: number}>({x: 0, y:0})
	const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false)
	
	const viewImageRef = useRef<HTMLImageElement | null>(null)
	const totalImages = images.length

	function handleImageZoom() {
		const target = viewImageRef.current as HTMLImageElement
		const {offsetLeft, offsetTop} = target
		setViewImagePos({x: offsetLeft, y: offsetTop})

		target.style.transform = ""

		setViewImageDragStartPos({x: 0, y: 0})
		setViewImageDragOffset({x: 0, y:0})

		if (!isImageZoomed) {
			setImageSwitchTransition("")
		} else {
			setImageSwitchTransition("transform 0.5s, scale 0.5s")
		}

		setIsImageZoomed(oldValue => !oldValue)
	}

	function handleImageMouseMove(clientX:any, clientY:any, isMouse?:boolean) {

		const target = viewImageRef.current as HTMLImageElement

		const {clientWidth, clientHeight} = target

		if (isImageZoomed) {
			
			if (isMobile && (!isMouse || isMobile === undefined)) {

				let {x: prevOffsetX, y: prevOffsetY} = viewImageDragOffset

				let newOffsetX = prevOffsetX + (clientX - viewImageDragStartPos.x)
				let newOffsetY = prevOffsetY + (clientY - viewImageDragStartPos.y)
				
				const clamppedOffsetX = Math.min(Math.max((newOffsetX), - clientWidth), clientWidth) * 0.5
				const clamppedOffsetY = Math.min(Math.max((newOffsetY), - clientHeight), clientHeight) * 0.5
				
				target.style.transform = `translate(${clamppedOffsetX}px, ${clamppedOffsetY}px)`
			} else {
				let offsetX = clientX - viewImagePos.x
				let offsetY = clientY - viewImagePos.y	
				const widthOffset = clientWidth/2
				const heightOffset = clientHeight/2
				
				const clamppedOffsetX = Math.min(Math.max((widthOffset - offsetX), -widthOffset), widthOffset)
				const clamppedOffsetY = Math.min(Math.max((heightOffset - offsetY), -heightOffset), heightOffset)
				target.style.transform = `translate(${clamppedOffsetX/2}px, ${clamppedOffsetY/2}px)`
			}
		}
	}

	function handleTouchStartImage({clientX, clientY}:any) {
		isImageZoomed && setViewImageDragStartPos({x: clientX, y: clientY})
	}

	function handleTouchDragImage({clientX, clientY}:any, isMouse?:boolean) {
		handleImageMouseMove(clientX, clientY, isMouse)
	}

	function handleTouchEndImage({clientX, clientY}:any) {
		const target = viewImageRef.current as HTMLImageElement
		const {clientWidth, clientHeight} = target

		let {x: prevOffsetX, y: prevOffsetY} = viewImageDragOffset
		
		let newOffsetX = prevOffsetX + (clientX - viewImageDragStartPos.x)
		let newOffsetY = prevOffsetY + (clientY - viewImageDragStartPos.y)

		const clamppedOffsetX = Math.min(Math.max((newOffsetX), - clientWidth), clientWidth)
		const clamppedOffsetY = Math.min(Math.max((newOffsetY), - clientHeight), clientHeight)
		
		setViewImageDragOffset({x: clamppedOffsetX, y: clamppedOffsetY})
	}

	/* Handle Image Viewing: Switching */

	const [imageSwitchStartPosX, setImageSwitchMousePosXStart] = useState<number>(0)
	const [isDraggingImageSwitch, setIsDraggingImageSwitch] = useState<boolean>(false)
	const [imageSwitchTransform, setImageSwitchTransform] = useState({translate: "", scale: "", rotate: ""})
	const [imageSwitchTransition, setImageSwitchTransition] = useState("")

	function switchImage(next: boolean) {
		setOpenImageIndex((oldIndex:number) => {
			console.log(oldIndex)
			let newIndex = Math.min(Math.max((next ? oldIndex + 1 : oldIndex - 1), 0), totalImages - 1)
			console.log(newIndex)
			return newIndex 
		})
	}

	function handleImageSwitchDragStart({clientX}: any) {
		setIsDraggingImageSwitch(true)
		setImageSwitchTransition("")
		setImageSwitchMousePosXStart(clientX)
	}

	function handleImageSwitchDrag({clientX}: any) {
		let startingPercent = ((imageSwitchStartPosX - (windowWidth/2))/windowWidth)*100
		let currentPercent = ((clientX - (windowWidth/2))/windowWidth)*100

		let percentDelta = currentPercent - startingPercent

		if (isDraggingImageSwitch && isMobile) {
			setImageSwitchTransform({translate: `translateX(${percentDelta}%)`, scale: `scale(${100 - Math.abs(percentDelta)}%)`, rotate:`rotateY(${45 * (-percentDelta/50)}deg)`})
		}
	}

	function handleImageSwitchDragEnd({clientX}: any) {
		if (isDraggingImageSwitch && isMobile) {
			setIsDraggingImageSwitch(false)

			let startingPercent = ((imageSwitchStartPosX - (windowWidth/2))/windowWidth)*100
			let currentPercent = ((clientX - (windowWidth/2))/windowWidth)*100
	
			let percentDelta = currentPercent - startingPercent
			
			if (openImageIndex === 0) {
				percentDelta = Math.min(percentDelta, 0)
			}
	
			if (openImageIndex === (totalImages - 1)) {
				percentDelta = Math.max(percentDelta, 0)
			}

			if (percentDelta < -20) {
				setImageSwitchTransform({translate: `translateX(100%)`, scale: `scale(0.25)`, rotate: `rotateY(-45deg)`})
				switchImage(true)
			} else if (percentDelta > 20) {
				setImageSwitchTransform({translate: `translateX(-100%)`, scale: `scale(0.25)`, rotate: `rotateY(45deg)`})
				switchImage(false)
			}
			setTimeout(() => {
				setImageSwitchTransition("transform 0.5s")
				setImageSwitchTransform({translate: `translateX(0)`, scale: `scale(1)`, rotate: `rotateY(0)`})
			}, 10)
		}
	}
	
	return (
		<div
			className='view-image'
			onMouseMove={({nativeEvent}) => {
				!isMobile && handleImageMouseMove(nativeEvent.clientX, nativeEvent.clientY)
			}}
			>
			
			{(totalImages > 1 && !isMobile) && <>
				<div className={`left-button ${openImageIndex === 0 && "disabled"}`} onClick={() => switchImage(false)}>
					<FontAwesomeIcon icon={faCaretLeft}/>
				</div>
				<div className={`right-button ${openImageIndex === (totalImages - 1) && "disabled"}`} onClick={() => switchImage(true)}>
					<FontAwesomeIcon icon={faCaretRight}/>
				</div>
			</>}

			{(isMobile && !isImageZoomed) && (
				<div
					className="drag-image-switch" 
					onMouseDown={handleImageSwitchDragStart}
					onMouseMove={handleImageSwitchDrag}
					onMouseUp={handleImageSwitchDragEnd}
					onTouchStart={({changedTouches}) => handleImageSwitchDragStart(changedTouches[0])}
					onTouchMove={({changedTouches}) => handleImageSwitchDrag(changedTouches[0])}
					onTouchEnd={({changedTouches}) => handleImageSwitchDragEnd(changedTouches[0])}
				/>
			)}

			<img
				draggable={false}
				ref={viewImageRef}
				style={{transform: `${imageSwitchTransform.translate} ${imageSwitchTransform.scale} ${imageSwitchTransform.rotate}`, transition: imageSwitchTransition}}
				className={`${isImageZoomed ? "zoomed" : ""}`}
				src={images[openImageIndex].url}
				alt={`Post Number: ${openImageIndex + 1}`}
				onClick={handleImageZoom}
				onMouseDown={handleTouchStartImage}
				onMouseMove={({clientX, clientY}) => handleTouchDragImage({clientX, clientY}, true)}
				onMouseUp={handleTouchEndImage}
				onTouchStart={({changedTouches}) => handleTouchStartImage(changedTouches[0])}
				onTouchMove={({changedTouches}) => handleTouchDragImage(changedTouches[0])}
				onTouchEnd={({changedTouches}) => handleTouchEndImage(changedTouches[0])}
			/>
			
			<div 
				tabIndex={0} 
				className="close-button" 
				onClick={() => {
					setOpenImageIndex(-1)
					setIsImageZoomed(false)
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						setOpenImageIndex(-1)
						setIsImageZoomed(false)
					}
				}}>
					<FontAwesomeIcon icon={faXmark}/>
			</div>
		</div>
	)
}

export default ImageViewer