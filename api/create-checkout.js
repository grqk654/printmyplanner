import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { plannerType, plannerName, theme, answers } = req.body

  if (!plannerType || !plannerName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const baseUrl = 'https://www.printmyplanner.com'

  try {
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
      cancel_url: `${baseUrl}/shop`,
      metadata: {
        plannerType,
        plannerName,
        theme,
        answers: JSON.stringify(answers).slice(0, 500),
      },
      billing_address_collection: 'auto',
    })

    return res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Stripe error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
