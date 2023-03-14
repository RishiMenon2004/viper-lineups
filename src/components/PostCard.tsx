import { useQuery } from '../convex/_generated/react';
import { Document, Id } from "../convex/_generated/dataModel";
import { Tag } from './Tags';
import { TagObject } from './Tags/TagObject';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

function PostCard({
	selected,
	onClick,
	data,
}: {
	selected: boolean,
	onClick: Function,
	data: Document<"posts">,
}) {

	const imagesLength = data.images.length
	
	const getCoverImage = data.images.find(image => {
		return image.cover
	})

	return (
		<article id={data._id.id} className={"card-post" + (selected ? " selected" : "")} onClick={() => onClick()} onKeyDown={(e) => {e.key === "Enter" && onClick()}} tabIndex={0}>
			<div className='card-title' style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${data.map}.png)`}}>
				<div className='map-name'>
					{data.map}
				</div>
				<h3>{data.title}</h3>
			</div>
			<div className='card-description' style={{whiteSpace: "pre-line"}}>
				{data.body}
			</div>
			<div className='card-content' style={{backgroundImage: `url(${getCoverImage?.url})`}}>
				<div className='post-details'>
					<div className='tags-container'>
						{data.tags.map((tag: TagObject, index: number) => {
							return index < 3 && <Tag key={index} isSmall={true} tag={tag}/>
						})}
					</div>
					{(imagesLength && imagesLength > 1) && <div className='images-overflow'>
						<FontAwesomeIcon icon={faImage}/> +{imagesLength - 1}
					</div>}
				</div>
			</div>
		</article>
	)
}

export default PostCard