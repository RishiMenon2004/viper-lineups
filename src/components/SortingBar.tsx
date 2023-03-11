import { faCircleHalfStroke, faLocationCrosshairs, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Document } from "../convex/_generated/dataModel";
import { useQuery } from "../convex/_generated/react";
import { SelectableTag } from "./Tags";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default function SortingBar({floating, handleTagClick, handleSelectChange}: {floating:boolean, handleTagClick:Function, handleSelectChange:Function}) {
	
	const tagsQuery = useQuery("tags/getTags")

	const sideTags = tagsQuery?.filter(tag => {
		return tag.category === "sides"
	})

	const abilityTags = tagsQuery?.filter(tag => {
		return tag.category === "abilities"
	})

	return (
		<div className={'sorting_bar' + (floating ? " floating" : "")}>
			{/* <span className="sort_title"><FontAwesomeIcon icon={faFilter}/>Filters</span> */}
			{/* <div className='seperator'></div> */}
			<div className='section'>
				<span className="section_name">
					<FontAwesomeIcon icon={faLocationCrosshairs}/>
					Map
				</span>
				<span className="section_content">
					<select className="map_selector" onChange={e => handleSelectChange(e)}>
						<option>All</option>
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
				</span>
			</div>
			
			<div className='section'>
				<span className="section_name">
					<FontAwesomeIcon icon={faCircleHalfStroke}/>
					Side
				</span>
				<span className="section_content">
					{sideTags?.map((tag:Document<"tags">, index:number) => {
						return <SelectableTag key={index} onClick={() => handleTagClick(tag.id, "side")} id={tag.id}/>
					})}
				</span>
			</div>

			<div className='section'>
				<span className="section_name">
					<FontAwesomeIcon icon={faScrewdriverWrench}/>
					Ability
				</span>
				<span className="section_content">
					{abilityTags?.map((tag:Document<"tags">, index:number) => {
						return <SelectableTag key={index} onClick={() => handleTagClick(tag.id, "ability")} id={tag.id}/>
					})}
				</span>
			</div>
		</div>
	)
}