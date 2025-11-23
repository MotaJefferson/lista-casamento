const replaceVars = (text: string, vars: Record<string, any>) => {
  let newText = text || '';
  Object.keys(vars).forEach(key => {
    newText = newText.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
  });
  return newText;
};

// Template Base Moderno
const baseHtml = (title: string, content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; font-weight: 300; text-transform: uppercase; }
            .content { padding: 40px 30px; line-height: 1.8; font-size: 16px; color: #52525b; }
            .footer { background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
            .btn { display: inline-block; padding: 12px 24px; background: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; margin-top: 20px; }
            strong { color: #18181b; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Enviado com carinho • ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
  </html>
`;

export const emailTemplates = {
  // RSVP (Confirmação de Presença)
  rsvpConfirmation: (name: string, count: number, config: any) => {
    const defaultContent = `
        <p>Olá <strong>{name}</strong>,</p>
        <p>Que alegria saber que você estará conosco neste dia tão especial! Sua presença foi confirmada para <strong>{guests} pessoa(s)</strong>.</p>
        <p>Estamos preparando tudo com muito carinho e mal podemos esperar para celebrar juntos.</p>
        <br>
        <p style="text-align: center;">Nos vemos lá!</p>
    `;

    const userContent = config.email_rsvp_content || defaultContent;
    const finalContent = replaceVars(userContent, { name, guests: count });
    
    return {
        subject: config.email_rsvp_subject || 'Confirmação de Presença',
        html: baseHtml(config.couple_name || 'Casamento', finalContent)
    };
  },

  // Confirmação de Presente (Compra)
  purchaseConfirmation: (guestEmail: string, giftName: string, price: number, id: string, coupleName: string, customSubject?: string, customContent?: string) => {
    const defaultContent = `
        <p>Olá <strong>{guest_name}</strong>,</p>
        <p>Não temos palavras para agradecer o seu carinho! Recebemos a notificação do seu presente: <strong>{gift_name}</strong>.</p>
        <p>Ficamos muito felizes com o seu gesto. Ele nos ajudará muito nesta nova etapa de nossas vidas.</p>
        <br>
        <p>Com carinho,<br>${coupleName}</p>
    `;

    const userContent = customContent || defaultContent;
    const vars = {
        guest_name: guestEmail.split('@')[0],
        gift_name: giftName,
        amount: price.toFixed(2).replace('.', ','),
        payment_id: id
    };

    return {
        subject: customSubject || `Obrigado pelo presente! - ${coupleName}`,
        html: baseHtml('Muito Obrigado!', replaceVars(userContent, vars))
    };
  },

  // Notificação Admin (Simples)
  purchaseNotificationAdmin: (email: string, gift: string, price: number, id: string) => ({
    subject: '🎁 Novo Presente Recebido!',
    html: baseHtml('Novo Presente', `
        <p><strong>Convidado:</strong> ${email}</p>
        <p><strong>Item:</strong> ${gift}</p>
        <p><strong>Valor:</strong> R$ ${price.toFixed(2).replace('.', ',')}</p>
        <p><strong>ID:</strong> ${id}</p>
    `)
  })
};