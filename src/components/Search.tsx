import { faCrosshairs, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react"


function Search() {

    const [isMobile, setIsMobile] = useState(false)
    const [containerWidth, setContainerWidth] = useState(0)

	const searchbox:any = useRef()

	const getContainerWidth = () => {
        const {clientWidth: width} = searchbox.current
        return width
    }

    const handleResize = () => {
        setContainerWidth(getContainerWidth())
        setIsMobile(containerWidth <= 600)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

	let inputPlaceholder = isMobile ? "Search" : "Search or Create a new lineup"

	return <div ref={searchbox} className="searchbar">
		<div className="dynamic-icon">
			<FontAwesomeIcon icon={faMagnifyingGlass} />
		</div>
		<input placeholder={inputPlaceholder}/>
		<button><FontAwesomeIcon icon={faCrosshairs} /> New Lineup</button>
	</div>
}

export default Search