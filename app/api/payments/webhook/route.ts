import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('[v0] Webhook received:', JSON.stringify(body, null, 2))

    // Always return 200/201 to acknowledge receipt
    // MercadoPago will retry if we don't respond correctly

    // Handle different webhook types
    if (body.type === 'payment') {
      const paymentId = body.data.id

      // Verify webhook signature (if using Webhook verification)
      // const xSignature = request.headers.get('x-signature')
      // const xRequestId = request.headers.get('x-request-id')
      // Verify signature logic here

      // Get payment details from MercadoPago
      const { data: config } = await supabase
        .from('site_config')
        .select('mercadopago_access_token')
        .eq('id', 1)
        .single()

      if (!config?.mercadopago_access_token) {
        throw new Error('MercadoPago not configured')
      }

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.mercadopago_access_token}`,
          },
        }
      )

      if (!paymentResponse.ok) {
        throw new Error('Failed to fetch payment details')
      }

      const payment = await paymentResponse.json()

      const externalReference = payment.external_reference

      if (!externalReference) {
        console.error('[v0] No external_reference in payment:', payment)
        return Response.json({ received: true }, { status: 200 })
      }

      // Update purchase based on payment status
      const statusMap: Record<string, 'approved' | 'pending' | 'rejected'> = {
        'approved': 'approved',
        'pending': 'pending',
        'in_process': 'pending',
        'rejected': 'rejected',
        'cancelled': 'rejected',
        'refunded': 'rejected',
        'charged_back': 'rejected',
      }

      const purchaseStatus = statusMap[payment.status] || 'pending'

      // Update purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', externalReference)
        .single()

      if (purchaseError || !purchase) {
        console.error('[v0] Purchase not found:', externalReference, purchaseError)
        // Still return 200 to acknowledge webhook
        return Response.json({ received: true }, { status: 200 })
      }

      // Update purchase status
      const updateData: any = {
        payment_id: paymentId.toString(),
        payment_status: purchaseStatus,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('purchases')
        .update(updateData)
        .eq('id', externalReference)

      if (updateError) {
        console.error('[v0] Error updating purchase:', updateError)
      } else {
        console.log(`[v0] Payment ${payment.status} for purchase:`, externalReference)
      }

      // Send confirmation email only for approved payments
      if (payment.status === 'approved') {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/email/send-purchase-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId: externalReference }),
          })
        } catch (emailError) {
          console.error('[v0] Failed to send confirmation email:', emailError)
          // Don't fail the webhook if email fails
        }
      }
    }

    // Always return 200/201 to acknowledge receipt
    // MercadoPago will retry if we return error status
    return Response.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    // Still return 200 to prevent MercadoPago from retrying
    // Log the error for manual investigation
    return Response.json(
      { received: true, error: 'Error processing webhook' },
      { status: 200 }
    )
  }
}
