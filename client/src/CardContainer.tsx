import React, { useEffect, useState } from 'react'
import Card from './Card'
import { trpc } from './utils/trpc'

export type Item = {
	desc: string
	id: number
	state: 'COMPLETE' | 'INCOMPLETE' | 'INPROGRESS'
}

const CardContainer = () => {
	const [desc, setDesc] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')

	const [items, setItems] = useState<Item[]>([])
	const { data, isLoading, refetch } = trpc.readAllItems.useQuery({ username })
	const updateItem = trpc.updateItem.useMutation()
	const deleteItem = trpc.deleteItem.useMutation({
		onSuccess: () => refetch(),
	})
	const updateItemState = trpc.updateItemState.useMutation({
		onSuccess: () => refetch(),
	})
	const addItem = trpc.addItem.useMutation({
		onSuccess: () => refetch(),
	})
	useEffect(() => {
		if (data) {
			setItems(data)
		}
	}, [data])

	if (isLoading) {
		console.log(data)
		return <div>Loading...</div>
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key == 'Enter' && desc.trim() != '') {
			addItem.mutate(desc)
			setDesc('')
		}
	}

	const moveToState = (state: 'COMPLETE' | '' | 'INPROGRESS', id: number) => {
		if (state === '') {
			console.log('deleted', id)
			deleteItem.mutate(id)
			const filteredItems = items.filter((e) => e.id !== id)
			setItems(filteredItems)
			return
		}
		let temp: Item[] = []
		for (let i = 0; i < items.length; i += 1) {
			if (items[i].id === id) {
				console.log('updated state', id)
				updateItemState.mutate({
					id,
					state,
				})
				items[i].state = state
			}
			temp.push(items[i])
		}
	}

	return (
		<div className='flex flex-col justify-center'>
			<div className='text-4xl text-center font-bold'>
				The Greatest Todo App of All Time
			</div>
			<input
				className='form-input border mt-4 px-4 py-3 rounded-full'
				onChange={(e) => setDesc(e.target.value)}
				type='text'
				value={desc}
				onKeyDown={handleKeyPress}
			/>
			<div className='grid grid-cols-3 gap-6'>
				<div className='mt-6 border rounded-md overflow-hidden'>
					<div className='flex w-72 bg-red-100 p-3 items-center'>
						<span className='w-2 h-2 mr-3 rounded-[100%] bg-red-600'></span>
						<span className='font-bold text-lg'>Incomplete</span>
					</div>
					<div className='w-72 h-[60vh] overflow-y-scroll my-auto'>
						{items
							.filter((e) => e.state == 'INCOMPLETE')
							.map((e) => (
								<div onClick={(_) => moveToState('INPROGRESS', e.id)}>
									<Card desc={e.desc} key={e.id} id={e.id} state={e.state} />
								</div>
							))}
					</div>
				</div>
				<div className='mt-6 border rounded-md overflow-hidden'>
					<div className='flex w-72 bg-yellow-100 p-3 items-center'>
						<span className='w-2 h-2 mr-3 rounded-[100%] bg-yellow-600'></span>
						<span className='font-bold text-lg'>In Progress</span>
					</div>
					<div className='w-72 h-[60vh] overflow-y-scroll my-auto'>
						{items
							.filter((e) => e.state == 'INPROGRESS')
							.map((e) => (
								<div onClick={(_) => moveToState('COMPLETE', e.id)}>
									<Card desc={e.desc} key={e.id} id={e.id} state={e.state} />
								</div>
							))}
					</div>
				</div>

				<div className='mt-6 border rounded-md overflow-hidden'>
					<div className='flex w-72 bg-green-100 p-3 items-center'>
						<span className='w-2 h-2 mr-3 rounded-[100%] bg-green-600'></span>
						<span className='font-bold text-lg'>Complete</span>
					</div>
					<div className='w-72 h-[60vh] overflow-y-scroll my-auto'>
						{items
							.filter((e) => e.state == 'COMPLETE')
							.map((e) => (
								<div onClick={(_) => moveToState('', e.id)}>
									<Card desc={e.desc} key={e.id} id={e.id} state={e.state} />
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default CardContainer
