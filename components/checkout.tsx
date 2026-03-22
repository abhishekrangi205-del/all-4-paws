'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession } from '@/app/actions/stripe'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

export default function Checkout({ productId }: { productId: string }) {
  const startCheckoutSessionForProduct = useCallback(
    () => startCheckoutSession(productId),
    [productId],
  )

  if (!stripePromise) {
    return (
      <div id="checkout" className="w-full p-8 text-center text-muted-foreground">
        Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret: startCheckoutSessionForProduct }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
