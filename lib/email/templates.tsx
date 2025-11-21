export const emailTemplates = {
  otpCode: (email: string, otp: string) => ({
    subject: 'Seu código de verificação',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63 0%, #f06292 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #e91e63; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e91e63; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💕 Casamento</h1>
              <p>Seu código de verificação</p>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Você solicitou acesso ao seu histórico de presentes. Use o código abaixo para completar o login:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>Este código expira em 10 minutos. Se você não solicitou este código, ignore este email.</p>
              <p>Os noivos 💕</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Não responda este email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  purchaseConfirmation: (
    guestEmail: string,
    giftName: string,
    giftPrice: number,
    paymentId: string,
    coupleName: string
  ) => ({
    subject: 'Presente Confirmado - Casamento ' + coupleName,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63 0%, #f06292 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .gift-box { background: white; border-left: 4px solid #e91e63; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .label { color: #999; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .value { font-weight: bold; color: #333; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            .cta-button { display: inline-block; background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💝 Obrigado!</h1>
              <p>Seu presente foi confirmado</p>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Agradecemos imensamente por escolher um presente para nosso casamento!</p>
              
              <div class="gift-box">
                <div class="label">Presente</div>
                <div class="value">${giftName}</div>
                
                <div style="margin-top: 15px;">
                  <div class="label">Valor</div>
                  <div class="value">R$ ${giftPrice.toFixed(2).replace('.', ',')}</div>
                </div>
                
                <div style="margin-top: 15px;">
                  <div class="label">ID da Transação</div>
                  <div class="value" style="font-family: monospace; font-size: 12px;">${paymentId}</div>
                </div>
              </div>

              <p>Você está ajudando a construir nosso sonho! Sua compra foi confirmada e você receberá mais informações sobre a entrega do presente.</p>

              <p>Com carinho,<br>${coupleName}</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Não responda este email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  purchaseNotificationAdmin: (
    guestEmail: string,
    giftName: string,
    giftPrice: number,
    paymentId: string
  ) => ({
    subject: 'Novo Presente Recebido!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; border: 1px solid #e0e0e0; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Novo Presente!</h1>
              <p>Você recebeu um presente</p>
            </div>
            <div class="content">
              <p>Ótimas notícias! Alguém escolheu um presente para vocês:</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">Convidado:</span>
                  <span class="value">${guestEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Presente:</span>
                  <span class="value">${giftName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Valor:</span>
                  <span class="value">R$ ${giftPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Transação:</span>
                  <span class="value" style="font-family: monospace; font-size: 12px;">${paymentId}</span>
                </div>
              </div>

              <p>Acesse o <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin/dashboard">painel administrativo</a> para ver mais detalhes.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Não responda este email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}
