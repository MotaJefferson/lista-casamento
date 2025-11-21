// Função auxiliar para substituir variáveis
const replaceVars = (text: string, vars: Record<string, any>) => {
  let newText = text;
  Object.keys(vars).forEach(key => {
    newText = newText.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
  });
  return newText;
};

// Função auxiliar para gerar link do Google Calendar
const generateCalendarLink = (title: string, date: string, time: string, address: string) => {
  try {
    if (!date || !time) return '';
    // Assume formato YYYY-MM-DD e HH:mm
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + (5 * 60 * 60 * 1000)); // +5 horas de festa

    const format = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${format(startDate)}/${format(endDate)}&details=${encodeURIComponent('Casamento')}&location=${encodeURIComponent(address)}`;
  } catch (e) {
    return '';
  }
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
  
  purchaseNotificationAdmin: (email: string, gift: string, price: number, id: string) => ({
    subject: 'Novo Presente Recebido!',
    html: baseHtml('Novo Presente!', `<p>Alguém comprou <strong>${gift}</strong> (R$ ${price})<br>Email: ${email}<br>ID: ${id}</p>`)
  }),

  rsvpConfirmation: (
    guestName: string,
    guestsCount: number,
    siteConfig: any
  ) => {
    const calendarLink = generateCalendarLink(
        `Casamento ${siteConfig.couple_name}`,
        siteConfig.wedding_date,
        siteConfig.ceremony_time || siteConfig.guests_arrival_time || '12:00',
        siteConfig.venue_address || ''
    );

    const content = `
      <p>Olá, <strong>${guestName}</strong>!</p>
      <p>Que alegria saber que você estará conosco! Sua presença foi confirmada para <strong>${guestsCount} pessoa(s)</strong>.</p>
      
      <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top:0;">Detalhes:</h3>
        <p><strong>Local:</strong> ${siteConfig.venue_name}<br>
        ${siteConfig.venue_address}</p>
        <p><strong>Horário de Chegada:</strong> ${siteConfig.guests_arrival_time || 'A confirmar'}</p>
      </div>

      ${calendarLink ? `<div style="text-align: center; margin: 30px 0;">
        <a href="${calendarLink}" target="_blank" style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold;">
          📅 Adicionar ao Calendário
        </a>
      </div>` : ''}
      
      <p>Nos vemos lá!</p>
    `;

    return { 
        subject: `Confirmação de Presença - ${siteConfig.couple_name}`, 
        html: baseHtml('Presença Confirmada', content) 
    };
  }
}