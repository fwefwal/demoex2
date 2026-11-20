import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { getCurrentUser } from '#/server/auth'
import {
  orderSchema,
  type OrderInput,
  collectOrderErrors,
} from '#/lib/order-validation'

export type OrderResult =
  | { ok: true; entryId: number }
  | { ok: false; fieldErrors?: Record<string, string>; formError?: string }

export const createOrder = createServerFn({ method: 'POST' })
  .validator((data: OrderInput) => data)
  .handler(async ({ data }): Promise<OrderResult> => {
    const user = await getCurrentUser()
    if (!user) {
      return { ok: false, formError: 'Требуется авторизация' }
    }

    const parsed = orderSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false, fieldErrors: collectOrderErrors(parsed.error) }
    }

    const { course, startAt, paymentType } = parsed.data

    const [day, month, year] = startAt.split('.').map(Number)
    const startDate = new Date(year, month - 1, day)

    if (isNaN(startDate.getTime())) {
      return { ok: false, formError: 'Некорректная дата начала обучения' }
    }

    const entry = await prisma.entry.create({
      data: {
        course,
        paymentType,
        startAt: startDate,
        status: 'Новая',
        userId: user.id,
      },
    })

    return { ok: true, entryId: entry.id }
  })
