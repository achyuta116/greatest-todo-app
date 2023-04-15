import { initTRPC, TRPCError } from '@trpc/server'
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
	verifyToken,
} from './dbFunctions'
import cors from 'cors'
import { JwtPayload } from 'jsonwebtoken'

interface Context {
	username: string | null
}

const prisma = new PrismaClient()

// Get the context type
// Initialize tRPC
const t = initTRPC.context<Context>().create()

const publicProcedure = t.procedure
export type AppRouter = typeof appRouter

export const appRouter = t.router({
	deleteItem: publicProcedure
		.input(
			z.object({
				username: z.string(),
				id: z.number(),
			})
		)
		.mutation(async (req) => {
			if (!req.ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
			await deleteTodo(req.input.id, req.input.username)
		}),
	addItem: publicProcedure
		.input(
			z.object({
				username: z.string(),
				desc: z.string(),
			})
		)
		.mutation(async (req) => {
			if (!req.ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
			return await addTodo(req.input.desc, req.input.username)
		}),
	updateItem: publicProcedure
		.input(
			z.object({
				desc: z.string(),
				id: z.number(),
				username: z.string(),
			})
		)
		.mutation(async (req) => {
			if (!req.ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
			return await updateTodo(req.input.id, req.input.desc, req.input.username)
		}),
	readItem: publicProcedure
		.input(
			z.object({
				username: z.string(),
				id: z.number(),
			})
		)
		.query(async (req) => {
			if (!req.ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
			return await readTodo(req.input.id, req.input.username)
		}),
	readAllItems: publicProcedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(async (req) => {
			if (!req.ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
			return await readAllTodos(req.input.username)
		}),
	updateItemState: publicProcedure
		.input(
			z.object({
				state: z.enum(['INCOMPLETE', 'COMPLETE', 'INPROGRESS']),
				id: z.number(),
				username: z.string(),
			})
		)
		.mutation(async (req) => {
			if (!req.ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
			return await updateItemState(
				req.input.state,
				req.input.id,
				req.input.username
			)
		}),
})

const { listen } = createHTTPServer({
	router: appRouter,
	middleware: cors(),
	createContext({ req }) {
		const authToken = req.headers.authorization?.split(' ')[1]
		if (!authToken)
			return {
				username: null,
			}
		return {
			username: (verifyToken(authToken) as JwtPayload).sub!,
		}
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
