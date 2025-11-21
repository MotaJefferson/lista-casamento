// Função auxiliar para substituir variáveis
const replaceVars = (text: string, vars: Record<string, any>) => {
  let newText = text;
  Object.keys(vars).forEach(key => {
    newText = newText.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
  });
  return newText;
};

const baseHtml = (title: string, content: string) => `
  <!DOCTYPE html>
  <html>
    <head><style>
      body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9f9f9; }
      .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      .header { background: #333; color: white; padding: 30px; text-align: center; }
      .content { padding: 30px; }
      .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>${title}</h1></div>
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
        <div class="footer"><p>Enviado automaticamente pelo site do casamento.</p></div>
      </div>
    </body>
  </html>
`;

export const emailTemplates = {
  otpCode: (email: string, otp: string, customSubject?: string, customContent?: string) => {
    const subject = customSubject || 'Seu código de verificação';
    const rawContent = customContent || 'Seu código é: {code}';
    const content = replaceVars(rawContent, { code: `<strong style="font-size: 24px; letter-spacing: 4px; color: #e91e63;">${otp}</strong>`, email });
    
    return { subject, html: baseHtml('Código de Acesso', content) };
  },

  purchaseConfirmation: (
    guestEmail: string,
    giftName: string,
    giftPrice: number,
    paymentId: string,
    coupleName: string,
    customSubject?: string, 
    customContent?: string
  ) => {
    const subject = customSubject || `Presente Confirmado - ${coupleName}`;
    const rawContent = customContent || 'Obrigado por nos presentear com {gift_name}!';
    
    const vars = {
        guest_name: guestEmail.split('@')[0], // Fallback name
        gift_name: `<strong>${giftName}</strong>`,
        amount: `R$ ${giftPrice.toFixed(2).replace('.', ',')}`,
        payment_id: paymentId
    };
    
    return { subject, html: baseHtml('Obrigado!', replaceVars(rawContent, vars)) };
  },
  
  // Admin notification remains standard for simplicity
  purchaseNotificationAdmin: (email: string, gift: string, price: number, id: string) => ({
    subject: 'Novo Presente Recebido!',
    html: baseHtml('Novo Presente!', `<p>Alguém comprou <strong>${gift}</strong> (R$ ${price})<br>Email: ${email}<br>ID: ${id}</p>`)
  })
}