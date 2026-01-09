import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const purchaseId = id

    console.log('[v0] GET /api/purchases/[id] - purchaseId:', purchaseId)

    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (error) {
      console.error('[v0] Purchase fetch error:', error)
      return Response.json(
        { message: 'Purchase not found', error: error.message },
        { status: 404 }
      )
    }

    if (!purchase) {
      return Response.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', purchase.gift_id)
      .single()

    if (giftError) {
      console.error('[v0] Gift fetch error:', giftError)
    }

    return Response.json({ purchase, gift: gift || null })
  } catch (error) {
    console.error('[v0] Get purchase error:', error)
    return Response.json(
      { message: 'Error fetching purchase', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const purchaseId = id
    
    const body = await request.json().catch(() => ({}))
    const { payment_status } = body

    if (!payment_status || !['approved', 'pending', 'rejected'].includes(payment_status)) {
      return Response.json(
        { message: 'Status inválido fornecido' },
        { status: 400 }
      )
    }

    console.log(`[v0] Atualizando manualmente compra ${purchaseId} para ${payment_status}`)

    const { error: updateError } = await supabase
        .from('purchases')
        .update({
            payment_status: payment_status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', purchaseId)

    if (updateError) {
        console.error('Error updating purchase:', updateError)
        return Response.json({ message: 'Erro ao atualizar banco de dados' }, { status: 500 })
    }

    // Se aprovado, tentar disparar o email de confirmação
    if (payment_status === 'approved') {
        const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
        fetch(`${appUrl}/api/email/send-purchase-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId }),
        }).catch(err => console.error('Failed to trigger email:', err))
    }

    return Response.json({ success: true, payment_status })

  } catch (error) {
    console.error('[v0] PATCH purchase error:', error)
    return Response.json(
      { message: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const purchaseId = id

    // TODO: Add admin auth check

    // Only allow deletion of pending purchases
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('payment_status')
      .eq('id', purchaseId)
      .single()

    if (fetchError || !purchase) {
      return Response.json(
        { message: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Permite deletar se for pending ou rejected. Approved não deveria ser deletado para histórico.
    if (purchase.payment_status === 'approved') {
      return Response.json(
        { message: 'Compras aprovadas não podem ser excluídas' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', purchaseId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] DELETE /api/purchases error:', error)
    return Response.json(
      { message: 'Error deleting purchase' },
      { status: 500 }
    )
  }
}