import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { purchaseId, giftId, email } = await request.json()

    if (!purchaseId || !giftId || !email) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Buscar o presente
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()

    if (giftError || !gift) {
      throw new Error('Gift not found')
    }

    // 2. Buscar configurações (Token)
    const { data: config } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .single()

    if (!config?.mercadopago_access_token) {
      throw new Error('MercadoPago not configured')
    }

    // 3. Inicializar o SDK do Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken: config.mercadopago_access_token 
    });

    // 4. Criar a Preferência usando o SDK
    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const result = await preference.create({
      body: {
        items: [
          {
            id: gift.id,
            title: gift.name,
            description: gift.description || 'Presente de Casamento',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(gift.price)
          }
        ],
        payer: {
          email: email
        },
        back_urls: {
          success: `${baseUrl}/payment/success?purchase_id=${purchaseId}`,
          failure: `${baseUrl}/payment/failure?purchase_id=${purchaseId}`,
          pending: `${baseUrl}/payment/pending?purchase_id=${purchaseId}`
        },
        auto_return: 'all',
        external_reference: purchaseId,
        statement_descriptor: 'CASAMENTO',
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" } // Opcional: Remove boleto para focar em Pix/Cartão
          ],
          installments: 12
        },
        binary_mode: true // Opcional: Força aprovação instantânea (sem pendência de análise)
      }
    })

    // 5. Retornar o link correto
    // O SDK retorna init_point (prod) e sandbox_init_point (teste)
    // Se o token for de teste (começa com TEST), o init_point normal já redireciona para o sandbox na maioria dos casos,
    // mas para garantir, mantemos a lógica.
    const isTestMode = config.mercadopago_access_token.startsWith('TEST-')
    const checkoutUrl = isTestMode && result.sandbox_init_point 
      ? result.sandbox_init_point 
      : result.init_point

    return Response.json({
      init_point: checkoutUrl,
      preference_id: result.id,
      is_test_mode: isTestMode,
    })

  } catch (error) {
    console.error('[v0] Create preference error:', error)
    return Response.json(
      { message: error instanceof Error ? error.message : 'Error creating preference' },
      { status: 500 }
    )
  }
}