export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { plannerType, plannerName, theme, answers } = req.body

  if (!plannerType || !plannerName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const stripe = await import('stripe').then(m => m.default(process.env.STRIPE_SECRET_KEY))

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:5173'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/create`,
    metadata: {
      plannerType,
      plannerName,
      theme,
      answers: JSON.stringify(answers).slice(0, 500),
    },
    customer_email: undefined,
    billing_address_collection: 'auto',
  })

  return res.status(200).json({ url: session.url, sessionId: session.id })
}
