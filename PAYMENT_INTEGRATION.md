# MercadoPago Payment Integration

This document describes how the wedding registry website integrates with MercadoPago for payment processing.

## Architecture Overview

The payment flow follows this sequence:

1. **Purchase Creation** → Guest enters email and clicks "Prosseguir para Pagamento"
2. **Preference Creation** → Server creates a MercadoPago payment preference
3. **Redirect to MercadoPago** → Guest is redirected to MercadoPago Checkout
4. **Payment Processing** → Guest completes payment on MercadoPago
5. **Return & Webhook** → Guest returns to site, webhook updates database

## API Endpoints

### POST /api/purchases
Creates a purchase record and payment preference.

**Request:**
\`\`\`json
{
  "giftId": "uuid",
  "guestEmail": "guest@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "purchase_id": "uuid",
  "init_point": "https://www.mercadopago.com.br/checkout/..."
}
\`\`\`

### POST /api/payments/create-preference
Creates a MercadoPago payment preference with item details.

**Request:**
\`\`\`json
{
  "purchaseId": "uuid",
  "giftId": "uuid",
  "email": "guest@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "init_point": "https://www.mercadopago.com.br/checkout/...",
  "preference_id": "mercadopago-preference-id",
  "is_test_mode": true
}
\`\`\`

**Note:** When using test credentials (starting with `TEST-`), the system automatically uses `sandbox_init_point` for sandbox environment.

### POST /api/payments/webhook
Webhook endpoint that receives payment notifications from MercadoPago.

**Webhook Payload (from MercadoPago):**
\`\`\`json
{
  "type": "payment",
  "data": {
    "id": "payment-id"
  }
}
\`\`\`

**Actions on Payment Status:**
- **approved**: Updates purchase payment_status to "approved", sends confirmation email
- **pending/in_process**: Updates purchase payment_status to "pending"
- **rejected/cancelled/refunded/charged_back**: Updates purchase payment_status to "rejected"

**Important:** The webhook always returns HTTP 200/201 to acknowledge receipt. MercadoPago will retry if the endpoint doesn't respond correctly. The system handles multiple payment statuses and maps them appropriately.

## MercadoPago API Calls

### Create Preference
**Endpoint:** `POST https://api.mercadopago.com/checkout/preferences`

**Headers:**
- `Authorization: Bearer {ACCESS_TOKEN}`
- `Content-Type: application/json`

**Request Body (simplified):**
\`\`\`json
{
  "items": [{
    "title": "Gift Name",
    "description": "Gift Description",
    "unit_price": 100.00,
    "quantity": 1,
    "currency_id": "BRL"
  }],
  "payer": {
    "email": "guest@example.com"
  },
  "back_urls": {
    "success": "https://yoursite.com/payment/success?purchase_id=xyz",
    "failure": "https://yoursite.com/payment/failure?purchase_id=xyz",
    "pending": "https://yoursite.com/payment/pending?purchase_id=xyz"
  },
  "notification_url": "https://yoursite.com/api/payments/webhook",
  "external_reference": "purchase-id",
  "auto_return": "all"
}
\`\`\`

### Get Payment Details
**Endpoint:** `GET https://api.mercadopago.com/v1/payments/{payment_id}`

**Headers:**
- `Authorization: Bearer {ACCESS_TOKEN}`

**Response includes:**
- `status`: "approved" | "rejected" | "pending"
- `external_reference`: Purchase ID
- `transaction_amount`: Amount paid

## Environment Variables Required

\`\`\`
MERCADOPAGO_ACCESS_TOKEN=TEST-XXXX... (stored in site_config table, not env)
NEXT_PUBLIC_URL=https://yoursite.com (for callback URLs)
\`\`\`

## Payment Status Flow

\`\`\`
pending (purchase created)
    ↓
(Guest pays on MercadoPago)
    ↓
Webhook received → Status mapped:
    - approved → purchase_status = "approved" + email sent
    - pending/in_process → purchase_status = "pending"
    - rejected/cancelled/refunded/charged_back → purchase_status = "rejected"
\`\`\`

**Status Mapping:**
- `approved` → `approved`
- `pending`, `in_process` → `pending`
- `rejected`, `cancelled`, `refunded`, `charged_back` → `rejected`

## Security Considerations

1. **External Reference**: Purchase ID stored as external_reference for webhook verification
2. **Webhook Verification**: Currently basic, can add signature verification using x-signature header
3. **Token Storage**: Access token stored in site_config table (admin-only access via RLS)
4. **Return URLs**: Use purchase_id to track payment outcome
5. **Email Validation**: All guest emails validated before purchase creation
6. **Webhook Response**: Always returns HTTP 200/201 to prevent MercadoPago retries. Errors are logged but don't fail the webhook.

## Test vs Production Mode

The system automatically detects test mode by checking if the Access Token starts with `TEST-`:
- **Test Mode**: Uses `sandbox_init_point` from MercadoPago response
- **Production Mode**: Uses `init_point` from MercadoPago response

This ensures proper environment handling without manual configuration.

## Testing

### Test Credentials
Use test credentials from MercadoPago dashboard:
- Access Token: `TEST-XXXX...`
- Public Key: `TEST-XXXX...`

### Test Cards (Brazil)
- Visa: 4111 1111 1111 1111
- Mastercard: 5555 5555 5555 4444
- Expiration: Any future date
- CVV: Any 3 digits

### Test Payment Flow
1. Go to /gifts page
2. Click "Presentear" on any gift
3. Enter test email
4. Click "Prosseguir para Pagamento"
5. Use test card on MercadoPago
6. Return to success page
7. Check webhook in logs: `console.log('[v0] Webhook received')`

## Troubleshooting

### "MercadoPago not configured"
- Ensure admin has set Access Token in dashboard config
- Check site_config table for mercadopago_access_token value

### Payment not showing as approved
- Check webhook logs: `/v0_app_debug_logs`
- Verify notification_url is publicly accessible
- Check MercadoPago webhook configuration in dashboard

### Wrong currency
- Currently hardcoded to "BRL" (Brazilian Real)
- To change: Edit `/app/api/payments/create-preference/route.ts`

## References
- MercadoPago Docs: https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/landing
- Create Preference API: https://www.mercadopago.com.ar/developers/en/reference/preferences/_checkout_preferences/post
- Payment Details API: https://www.mercadopago.com.ar/developers/en/reference/payments/_payments_id/get
