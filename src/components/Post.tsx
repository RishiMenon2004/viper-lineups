import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

function Post({id, onClick, tags, images, title}: any) {
	return (
		<article id={id} className="post" onClick={() => onClick()} onKeyDown={(e) => {e.key === "Enter" && onClick()}} tabIndex={0}>
			<h3>{title}</h3>
			<div className='post_content'>
				<div className='images_container'>
					{images.map((image:any, index: number) => {
						return <div key={index} className='image_container' style={{backgroundImage: `url(${image})`}}></div>
					})}
				</div>
				<div className='post_details'>
					<div className='tags_container'>
						{tags.map((tag:any) => {
							return tag
						})}
					</div>
					<div className='images_overflow'>
						<FontAwesomeIcon icon={faImage}/> +1
					</div>
				</div>
			</div>
		</article>
	)
}

export default Post