import { State } from '@prisma/client'
import { prismaClient } from './server'


export const deleteTodo = async (id: number) => {
	await prismaClient.todoItem.delete({
		where: {
			id,
		},
	})
}

export const addTodo = async (desc: string) => {
    return await prismaClient.todoItem.create({
        data: {
            desc
        }
    })
}

export const updateTodo = async (id: number | undefined, desc: string) => {
	return await prismaClient.todoItem.update({
        where: {
        },
        data: {
            id,
            desc
        }, 
	})
}

export const readTodo = async (id: number) => {
	return await prismaClient.todoItem.findFirst({
		where: {
			id,
		},
	})
}

export const readAllTodos = async () => {
	return await prismaClient.todoItem.findMany()
}

export const updateItemState = async (state: State, id: number) => {
	return await prismaClient.todoItem.update({
		where: {
			id,
		},
		data: {
			state,
		},
	})
}
