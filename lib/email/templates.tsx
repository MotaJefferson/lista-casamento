// Função auxiliar para substituir variáveis
const replaceVars = (text: string, vars: Record<string, any>) => {
  let newText = text || '';
  Object.keys(vars).forEach(key => {
    // Substitui {variavel} pelo valor, garantindo que não quebre se for nulo
    const value = vars[key] !== undefined && vars[key] !== null ? vars[key] : '';
    newText = newText.replace(new RegExp(`{${key}}`, 'g'), String(value));
  });
  return newText;
};

// Função auxiliar para gerar link do Google Calendar
const generateCalendarLink = (title: string, date: string, time: string, address: string) => {
  try {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + (5 * 60 * 60 * 1000)); 

    const format = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${format(startDate)}/${format(endDate)}&details=${encodeURIComponent('Casamento')}&location=${encodeURIComponent(address)}`;
  } catch (e) {
    return '';
  }
};

// Design Base do E-mail (Moderno e Clean)
const baseHtml = (title: string, content: string, siteName: string = 'Casamento') => `
  <!DOCTYPE html>
  <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #374151; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .header { background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 1px solid #f3f4f6; }
            .header-title { font-size: 24px; font-weight: 300; color: #111827; letter-spacing: -0.5px; margin: 0; }
            .header-subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-top: 8px; }
            .content { padding: 40px; line-height: 1.6; font-size: 16px; color: #4b5563; }
            .highlight-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; margin-top: 10px; }
            strong { color: #111827; font-weight: 600; }
            .data-row { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
            .data-label { font-weight: 500; color: #6b7280; }
            .data-value { font-weight: 600; color: #111827; text-align: right; }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
            <h1 class="header-title">${title}</h1>
            <div class="header-subtitle">${siteName}</div>
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
  // 1. Confirmação de Presença (Para o Convidado)
  rsvpConfirmation: (name: string, count: number, config: any) => {
    const defaultContent = `
        <p>Olá <strong>{name}</strong>,</p>
        <p>Que alegria saber que você estará conosco! Sua presença foi confirmada para <strong>{guests} pessoa(s)</strong>.</p>
        <p>Estamos preparando tudo com muito carinho e mal podemos esperar para celebrar juntos.</p>
        <br>
        <p style="text-align: center;">Nos vemos lá!</p>
    `;

    // Usa o conteúdo personalizado do banco ou o padrão
    const userContent = config.email_rsvp_content || defaultContent;
    const finalContent = replaceVars(userContent, { name, guests: count });
    
    // Adiciona botão do calendário se possível
    let calendarHtml = '';
    const calendarLink = generateCalendarLink(
        `Casamento ${config.couple_name}`,
        config.wedding_date,
        config.ceremony_time || config.guests_arrival_time || '12:00',
        config.venue_address || ''
    );
    if (calendarLink) {
        calendarHtml = `<div style="text-align: center; margin-top: 30px;"><a href="${calendarLink}" class="btn">📅 Adicionar ao Calendário</a></div>`;
    }

    return {
        subject: config.email_rsvp_subject || `Confirmação de Presença - ${config.couple_name}`,
        html: baseHtml('Presença Confirmada', finalContent + calendarHtml, config.couple_name)
    };
  },

  // 2. Confirmação de Presente (Para o Convidado)
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
        guest_name: guestEmail.split('@')[0], // Tenta pegar o nome do email se não tiver nome
        gift_name: giftName,
        amount: price.toFixed(2).replace('.', ','),
        payment_id: id
    };

    return {
        subject: customSubject || `Obrigado pelo presente! - ${coupleName}`,
        html: baseHtml('Muito Obrigado!', replaceVars(userContent, vars), coupleName)
    };
  },

  // 3. Notificação de RSVP (Para o Admin)
  rsvpNotificationAdmin: (data: any) => ({
    subject: `💕 Nova Presença: ${data.name}`,
    html: baseHtml('Nova Presença Confirmada', `
        <p>Alguém acabou de confirmar presença no site:</p>
        <div class="highlight-box">
            <div class="data-row"><span class="data-label">Nome</span> <span class="data-value">${data.name}</span></div>
            <div class="data-row"><span class="data-label">Qtd. Pessoas</span> <span class="data-value">${data.guests_count}</span></div>
            <div class="data-row"><span class="data-label">Telefone</span> <span class="data-value">${data.phone || '-'}</span></div>
            <div class="data-row"><span class="data-label">E-mail</span> <span class="data-value">${data.email || '-'}</span></div>
        </div>
        ${data.message ? `<p><strong>Mensagem deixada:</strong></p><p style="background:#fff; padding:10px; border:1px solid #eee; border-radius:4px;">${data.message}</p>` : ''}
    `)
  }),

  // 4. Notificação de Presente (Para o Admin)
  purchaseNotificationAdmin: (email: string, gift: string, price: number, id: string, guestName: string | null) => ({
    subject: `🎁 Novo Presente: ${gift}`,
    html: baseHtml('Novo Presente Recebido!', `
        <p>Boas notícias! Você recebeu um novo presente através do site.</p>
        <div class="highlight-box">
            <div class="data-row"><span class="data-label">Presente</span> <span class="data-value">${gift}</span></div>
            <div class="data-row"><span class="data-label">Valor</span> <span class="data-value">R$ ${price.toFixed(2).replace('.', ',')}</span></div>
            <div class="data-row"><span class="data-label">Convidado</span> <span class="data-value">${guestName || 'Não informado'}</span></div>
            <div class="data-row"><span class="data-label">E-mail</span> <span class="data-value">${email}</span></div>
            <div class="data-row"><span class="data-label">ID Transação</span> <span class="data-value" style="font-family:monospace">${id}</span></div>
        </div>
        <p style="text-align: center; margin-top: 20px;">Verifique o painel do Mercado Pago para mais detalhes.</p>
    `)
  }),

  // 5. Código OTP (Para Admin/Login - simplificado)
  otpCode: (email: string, otp: string) => ({
    subject: `Código de Acesso`,
    html: baseHtml('Seu Código de Acesso', `
        <p>Use o código abaixo para acessar o painel:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #111827; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="font-size: 12px; text-align: center;">Este código expira em 10 minutos.</p>
    `)
  })
};