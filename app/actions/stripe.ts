'use server'

import { stripe } from '@/lib/stripe'
import { SERVICES } from '@/lib/products'

export async function startCheckoutSession(productIds: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY.')
  }
  
  // Support multiple product IDs separated by commas
  const ids = productIds.split(',').filter(id => id.trim())
  
  if (ids.length === 0) {
    throw new Error('No products specified')
  }

  // Count occurrences of each product ID for quantity
  const productCounts = ids.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Build line items for each unique product
  const lineItems = Object.entries(productCounts).map(([id, quantity]) => {
    const product = SERVICES.find((p) => p.id === id)
    if (!product) {
      throw new Error(`Product with id "${id}" not found`)
    }
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.priceInCents,
      },
      quantity,
    }
  })

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: lineItems,
    mode: 'payment',
  })

  return session.client_secret
}
