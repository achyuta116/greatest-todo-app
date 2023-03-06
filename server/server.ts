import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { PrismaClient } from '@prisma/client'
import {
	deleteTodo,
	readAllTodos,
	readTodo,
	updateItemState,
	updateTodo,
	addTodo,
} from './dbFunctions'
import cors from 'cors'

const prisma = new PrismaClient()

// Get the context type
// Initialize tRPC
const t = initTRPC.create()
const publicProcedure = t.procedure
export type AppRouter = typeof appRouter

export const appRouter = t.router({
	deleteItem: publicProcedure.input(z.number()).mutation(async (req) => {
		await deleteTodo(req.input)
	}),
	addItem: publicProcedure.input(z.string()).mutation(async (req) => {
		return await addTodo(req.input)
	}),
	updateItem: publicProcedure
		.input(
			z.object({
				desc: z.string(),
				id: z.number().optional(),
			})
		)
		.mutation(async (req) => {
			return await updateTodo(req.input.id, req.input.desc)
		}),
	readItem: publicProcedure.input(z.number()).query(async (req) => {
		return await readTodo(req.input)
	}),
	readAllItems: publicProcedure.query(async () => {
		return await readAllTodos()
	}),
	updateItemState: publicProcedure
		.input(
			z.object({
				state: z.enum(['INCOMPLETE', 'COMPLETE', 'IN_PROGRESS']),
				id: z.number(),
			})
		)
		.mutation(async (req) => {
			return await updateItemState(req.input.state, req.input.id)
		}),
})

const { listen } = createHTTPServer({
	router: appRouter,
	middleware: cors(),
	createContext() {
		return {}
	},
})

const main = async () => {
	listen(3000)
}

main()
	.then(async () => await prisma.$disconnect())
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
export const prismaClient = prisma
