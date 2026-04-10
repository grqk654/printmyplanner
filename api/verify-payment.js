export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID' })
  }

  try {
    const stripe = await import('stripe').then(m => m.default(process.env.STRIPE_SECRET_KEY))
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    const customerEmail = session.customer_details?.email
    const plannerName = session.metadata?.plannerName || 'Your Planner'
    const plannerType = session.metadata?.plannerType || 'weekly'

    if (customerEmail) {
      await sendBrevoEmail(customerEmail, plannerName, plannerType, sessionId)
    }

    return res.status(200).json({
      success: true,
      email: customerEmail,
      plannerType,
      plannerName,
      metadata: session.metadata,
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    return res.status(500).json({ error: 'Verification failed' })
  }
}

async function sendBrevoEmail(toEmail, plannerName, plannerType, sessionId) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://www.printmyplanner.com`
    : 'http://localhost:5173'

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'PrintMyPlanner', email: 'hello@printmyplanner.com' },
      to: [{ email: toEmail }],
      subject: `Your ${plannerName} is ready to download`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: 'Georgia', serif; background: #FAFAF8; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #E8E4D8;">
            <div style="background: #2D5A1B; padding: 32px 36px;">
              <div style="font-family: Georgia, serif; font-size: 22px; color: #EAF3DE; font-weight: normal;">PrintMyPlanner</div>
              <div style="font-size: 13px; color: #C0DD97; margin-top: 4px;">Your custom planner is ready</div>
            </div>
            <div style="padding: 36px;">
              <div style="font-family: Georgia, serif; font-size: 24px; color: #1a1a14; margin-bottom: 12px;">
                ${plannerName} is ready to download
              </div>
              <p style="font-size: 15px; color: #6B6B5E; line-height: 1.7; margin-bottom: 24px;">
                Thank you for your purchase! Your AI-generated digital planner has been personalized based on your answers and is ready to open in GoodNotes, Notability, or any PDF app.
              </p>
              <a href="${baseUrl}/payment-success?session_id=${sessionId}" 
                 style="display: inline-block; background: #2D5A1B; color: #EAF3DE; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold; margin-bottom: 24px;">
                Download my planner
              </a>
              <div style="background: #EAF3DE; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #2D5A1B; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em;">How to use in GoodNotes</div>
                <ol style="font-size: 13px; color: #3B6D11; margin: 0; padding-left: 18px; line-height: 1.8;">
                  <li>Download the PDF to your iPad</li>
                  <li>Open GoodNotes → tap the + button</li>
                  <li>Choose "Import" and select your planner PDF</li>
                  <li>Use the Apple Pencil to write directly on the pages</li>
                </ol>
              </div>
              <p style="font-size: 12px; color: #8a8a7a; line-height: 1.6;">
                Bookmark the download link above — it's valid for 30 days. Questions? Reply to this email.
              </p>
            </div>
            <div style="border-top: 1px solid #E8E4D8; padding: 20px 36px; text-align: center;">
              <div style="font-size: 12px; color: #8a8a7a;">© 2026 PrintMyPlanner.com · Free custom planners for everyone</div>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Brevo error:', err)
  }
}
