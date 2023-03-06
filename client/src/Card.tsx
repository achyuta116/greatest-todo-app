import { Item } from './CardContainer'

type Props = Item

const Card = ({ desc }: Props) => {
	return (
		<div
			className='hover:shadow-xl hover:cursor-pointer hover:text-yellow-500
            hover:scale-[102%] p-2 text-lg font-sans break-words transition'
		>
			{desc}
		</div>
	)
}

export default Card
