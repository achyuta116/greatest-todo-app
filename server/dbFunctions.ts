import { State } from '@prisma/client'
import { prismaClient } from './server'
import { config } from 'dotenv'
import { JwtPayload, sign, verify } from 'jsonwebtoken'

config()

import { hash } from 'bcrypt'

const AUTH_SECRET: string = process.env.AUTH_SECRET!

export const login = async (username: string, password: string) => {
	password = await hash(password, 1)
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})
	if (user && user.pwd === password)
		return { token: sign( username , AUTH_SECRET, { expiresIn: '3 days' }) }
	if (!user) return { error: 'USER_NOT_FOUND' }
	if (user.pwd !== password) return { error: 'INC_PWD' }
	return { error: 'UNKNOWN' }
}

export const signup = async (username: string, password: string) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})
	if (!user) {
		await prismaClient.user.create({
			data: {
				pwd: await hash(password, 1),
				username,
			},
		})
		return sign( username , AUTH_SECRET, { expiresIn: '3 days' })
	}
	return { error: 'USERNAME_TAKEN' }
}

export const verifyToken = (token: string) => {
	try {
		return verify(token, AUTH_SECRET)
	} catch (e) {
		return null
	}
}

export const deleteTodo = async (id: number, username: string) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})
	await prismaClient.todoItem.delete({
		where: {
			userid_id: {
				userid: user!.userid,
				id,
			},
		},
	})
}

export const addTodo = async (desc: string, username: string) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})
	return await prismaClient.todoItem.create({
		data: {
			desc,
			userid: user!.userid,
		},
	})
}

export const updateTodo = async (
	id: number,
	desc: string,
	username: string
) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})

	return await prismaClient.todoItem.update({
		where: {
			userid_id: {
				userid: user!.userid,
				id,
			},
		},
		data: {
			desc,
		},
	})
}

export const readTodo = async (id: number, username: string) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})
	return await prismaClient.todoItem.findFirst({
		where: {
			userid: user!.userid,
			id,
		},
	})
}

export const readAllTodos = async (username: string) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})

	return await prismaClient.todoItem.findMany({
		where: {
			userid: user!.userid,
		},
	})
}

export const updateItemState = async (
	state: State,
	id: number,
	username: string
) => {
	const user = await prismaClient.user.findFirst({
		where: {
			username,
		},
	})
	return await prismaClient.todoItem.update({
		where: {
			userid_id: {
				userid: user!.userid,
				id,
			},
		},
		data: {
			state,
		},
	})
}
