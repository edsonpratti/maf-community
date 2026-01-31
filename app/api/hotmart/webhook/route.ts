import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This endpoint would be called by Hotmart webhook
export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.HOTMART_WEBHOOK_SECRET

    // Validate webhook signature
    const signature = request.headers.get('x-hotmart-hottok')
    if (!signature || signature !== webhookSecret) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = await request.json()

    // Hotmart webhook event
    const event = payload.event
    const data = payload.data

    const supabase = await createClient()

    // Find user by hotmart email
    const { data: customer } = await supabase
      .from('hotmart_customers')
      .select('user_id')
      .eq('hotmart_email', data.buyer.email)
      .single()

    if (!customer) {
      // User not found, create pending record
      return NextResponse.json({
        message: 'User not found, webhook received',
        status: 'pending'
      })
    }

    // Process based on event type
    let newStatus: 'ACTIVE' | 'REVOKED' | 'SUSPENDED' = 'ACTIVE'
    let purchaseStatus: 'APPROVED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' = 'APPROVED'

    switch (event) {
      case 'PURCHASE_APPROVED':
        newStatus = 'ACTIVE'
        purchaseStatus = 'APPROVED'
        break
      case 'PURCHASE_CANCELLED':
        newStatus = 'REVOKED'
        purchaseStatus = 'CANCELLED'
        break
      case 'PURCHASE_REFUNDED':
        newStatus = 'REVOKED'
        purchaseStatus = 'REFUNDED'
        break
      case 'PURCHASE_CHARGEBACK':
        newStatus = 'REVOKED'
        purchaseStatus = 'CHARGEBACK'
        break
      default:
        return NextResponse.json({ message: 'Event not handled' })
    }

    // Update or create order
    await supabase
      .from('hotmart_orders')
      .upsert({
        user_id: customer.user_id,
        order_id: data.purchase.transaction,
        product_id: data.product.id,
        purchase_status: purchaseStatus,
        purchase_type: data.purchase.offer_type === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'ONE_TIME',
        subscription_status: data.purchase.subscription?.status || null,
        raw_payload: payload,
      })

    // Update user status
    await supabase
      .from('profiles')
      .update({
        status_access: newStatus,
        verified_badge: newStatus === 'ACTIVE',
      })
      .eq('id', customer.user_id)

    // Update customer last verified
    await supabase
      .from('hotmart_customers')
      .update({
        last_verified_at: new Date().toISOString(),
        hotmart_customer_id: data.buyer.email,
      })
      .eq('user_id', customer.user_id)

    return NextResponse.json({
      message: 'Webhook processed successfully',
      status: newStatus
    })
  } catch (error: any) {
    console.error('Hotmart webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
