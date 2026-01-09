import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const purchaseId = id

    console.log(`[v0] Verificando status manualmente para compra: ${purchaseId}`)

    // 1. Buscar dados da compra e credenciais
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, payment_id, payment_status')
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      return Response.json({ message: 'Compra não encontrada' }, { status: 404 })
    }

    const { data: config } = await supabase
      .from('site_config')
      .select('mercadopago_access_token')
      .eq('id', 1)
      .single()

    if (!config?.mercadopago_access_token) {
      return Response.json({ message: 'Token do Mercado Pago não configurado' }, { status: 500 })
    }

    // 2. Inicializar SDK
    const client = new MercadoPagoConfig({ 
        accessToken: config.mercadopago_access_token 
    });
    const paymentClient = new Payment(client);

    let paymentData = null;

    // 3. Tentar buscar pelo ID do pagamento se existir
    if (purchase.payment_id) {
        try {
            paymentData = await paymentClient.get({ id: purchase.payment_id });
        } catch (error) {
            console.warn('Erro ao buscar por payment_id, tentando busca por referência:', error);
        }
    }

    // 4. Se não achou pelo ID, buscar por external_reference (ID da compra)
    if (!paymentData) {
        try {
            const searchResult = await paymentClient.search({
                options: {
                    external_reference: purchaseId,
                    limit: 1,
                    sort: 'date_created',
                    criteria: 'desc'
                }
            });

            if (searchResult.results && searchResult.results.length > 0) {
                paymentData = searchResult.results[0];
            }
        } catch (error) {
            console.error('Erro na busca do pagamento:', error);
        }
    }

    if (!paymentData) {
        return Response.json({ 
            message: 'Nenhum pagamento encontrado no Mercado Pago para esta compra',
            found: false
        }, { status: 404 })
    }

    // 5. Mapear status
    const statusMap: Record<string, 'approved' | 'pending' | 'rejected'> = {
        'approved': 'approved',
        'pending': 'pending',
        'in_process': 'pending',
        'rejected': 'rejected',
        'cancelled': 'rejected',
        'refunded': 'rejected',
        'charged_back': 'rejected',
    }

    const newStatus = statusMap[paymentData.status!] || 'pending'
    const mpPaymentId = paymentData.id!.toString()

    // 6. Atualizar banco se houver mudança ou para salvar o payment_id
    if (newStatus !== purchase.payment_status || purchase.payment_id !== mpPaymentId) {
        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                payment_id: mpPaymentId,
                payment_status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', purchaseId)

        if (updateError) {
            throw new Error('Erro ao atualizar banco de dados')
        }

        // Se aprovado agora, tentar enviar e-mail (opcional, evita spam se já foi enviado)
        if (newStatus === 'approved' && purchase.payment_status !== 'approved') {
             const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
             fetch(`${appUrl}/api/email/send-purchase-confirmation`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ purchaseId }),
             }).catch(console.error)
        }
    }

    return Response.json({ 
        success: true, 
        found: true,
        old_status: purchase.payment_status,
        new_status: newStatus,
        payment_id: mpPaymentId
    })

  } catch (error) {
    console.error('[v0] Check status error:', error)
    return Response.json(
      { message: 'Erro interno ao verificar status' },
      { status: 500 }
    )
  }
}