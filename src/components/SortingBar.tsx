import { faCircleHalfStroke, faLocationCrosshairs, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Document } from "../convex/_generated/dataModel";
import { useQuery } from "../convex/_generated/react";
import { SelectableTag } from "./Tags";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default function SortingBar({floating, handleTagClick, handleSelectChange}: {floating:boolean, handleTagClick:Function, handleSelectChange:Function}) {
	
	const tagsQuery = useQuery("tags/getTags")

	const sideTags = tagsQuery?.filter((tag:Document<"tags">) => {
		return tag.category === "sides"
	})

	const abilityTags = tagsQuery?.filter((tag:Document<"tags">) => {
		return tag.category === "abilities"
	})

	return (
		<div className={'sorting-bar' + (floating ? " floating" : "")}>
			<div className='section'>
				<div className="section-name">
					<FontAwesomeIcon icon={faLocationCrosshairs}/>
					Map
				</div>
				<div className="section-content">
					<select className="map-selector" onChange={e => handleSelectChange(e)}>
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
				</div>
			</div>
			
			<div className='section'>
				<div className="section-name">
					<FontAwesomeIcon icon={faCircleHalfStroke}/>
					Side
				</div>
				<div className="section-content">
					{sideTags?.map((tag:Document<"tags">, index:number) => {
						return <SelectableTag key={index} onClick={() => handleTagClick(tag.id, "side")} id={tag.id}/>
					})}
				</div>
			</div>

			<div className='section'>
				<div className="section-name">
					<FontAwesomeIcon icon={faScrewdriverWrench}/>
					Ability
				</div>
				<div className="section-content" tabIndex={-1}>
					{abilityTags?.map((tag:Document<"tags">, index:number) => {
						return <SelectableTag key={index} onClick={() => handleTagClick(tag.id, "ability")} id={tag.id}/>
					})}
				</div>
			</div>
		</div>
	)
}