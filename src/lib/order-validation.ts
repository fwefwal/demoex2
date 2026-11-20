import { z } from 'zod'

export const orderSchema = z.object({
  course: z.string().min(1, 'Выберите курс'),
  startAt: z
    .string()
    .min(1, 'Укажите дату начала обучения')
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Дата в формате ДД.ММ.ГГГГ'),
  paymentType: z.string().min(1, 'Выберите способ оплаты'),
})

export type OrderInput = z.infer<typeof orderSchema>

export const COURSES = [
  'Основы алгоритмизации и программирования',
  'Основы веб-дизайна',
  'Основы проектирования баз данных',
] as const

export const PAYMENT_TYPES = [
  { value: 'cash', label: 'Наличными' },
  { value: 'phone', label: 'Переводом по номеру телефона' },
] as const

export function collectOrderErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form')
    if (!errors[field]) {
      errors[field] = issue.message
    }
  }
  return errors
}
