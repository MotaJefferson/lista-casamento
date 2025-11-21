import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // O Mercado Pago pode enviar os dados na query string ou no body
    // Geralmente vem no body para notifications
    const url = new URL(request.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    let paymentId = id
    let type = topic

    // Se não veio na URL, tenta ler do corpo
    if (!paymentId) {
        const body = await request.json().catch(() => ({}))
        paymentId = body?.data?.id || body?.id
        type = body?.type || body?.topic
    }

    // Se ainda não tiver ID ou não for pagamento, apenas responde 200
    if (!paymentId || type !== 'payment') {
        return Response.json({ received: true }, { status: 200 })
    }

    console.log(`[v0] Webhook processing payment: ${paymentId}`)

    // 1. Buscar credenciais
    const { data: config } = await supabase
      .from('site_config')
      .select('mercadopago_access_token')
      .eq('id', 1)
      .single()

    if (!config?.mercadopago_access_token) {
      console.error('MercadoPago token missing')
      return Response.json({ received: true }, { status: 200 })
    }

    // 2. Inicializar SDK
    const client = new MercadoPagoConfig({ 
        accessToken: config.mercadopago_access_token 
    });
    
    const paymentClient = new Payment(client);

    // 3. Consultar o pagamento no Mercado Pago
    const payment = await paymentClient.get({ id: paymentId })

    if (!payment) {
        console.error('Payment not found in Mercado Pago')
        return Response.json({ received: true }, { status: 200 })
    }

    const externalReference = payment.external_reference

    if (!externalReference) {
        console.log('No external reference, ignoring')
        return Response.json({ received: true }, { status: 200 })
    }

    // 4. Mapear status
    const statusMap: Record<string, 'approved' | 'pending' | 'rejected'> = {
        'approved': 'approved',
        'pending': 'pending',
        'in_process': 'pending',
        'rejected': 'rejected',
        'cancelled': 'rejected',
        'refunded': 'rejected',
        'charged_back': 'rejected',
    }

    const purchaseStatus = statusMap[payment.status!] || 'pending'

    // 5. Atualizar banco de dados
    const { error: updateError } = await supabase
        .from('purchases')
        .update({
            payment_id: paymentId.toString(),
            payment_status: purchaseStatus,
            updated_at: new Date().toISOString(),
        })
        .eq('id', externalReference)

    if (updateError) {
        console.error('Error updating purchase:', updateError)
    } else {
        console.log(`Purchase ${externalReference} updated to ${purchaseStatus}`)
    }

    // 6. Enviar e-mail se aprovado
    if (payment.status === 'approved') {
        // Chama a rota de email internamente para não duplicar lógica
        fetch(`${process.env.NEXT_PUBLIC_URL}/api/email/send-purchase-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId: externalReference }),
        }).catch(err => console.error('Failed to trigger email:', err))
    }

    return Response.json({ received: true }, { status: 200 })

  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return Response.json({ received: true }, { status: 200 })
  }
}