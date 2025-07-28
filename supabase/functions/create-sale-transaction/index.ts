import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      kasir_id,
      customer_id,
      customer_name,
      customer_type,
      items, // { id, quantity, buyPrice, salePrice }[]
      summary, // { subtotal, discount, total, profit }
      payment, // { method, amount, change, remaining }
    } = await req.json();

    // 1. Stock validation
    const productIds = items.map(item => item.id);
    const { data: productsInStock, error: stockError } = await adminSupabaseClient
      .from('products')
      .select('id, name, stock')
      .in('id', productIds);

    if (stockError) throw stockError;

    for (const item of items) {
      const product = productsInStock.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        return new Response(JSON.stringify({ error: `Stok tidak mencukupi untuk produk: ${product?.name || item.name}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Insert into sales_transactions
    const { data: transaction, error: transactionError } = await adminSupabaseClient
      .from('sales_transactions')
      .insert({
        kasir_id,
        customer_id,
        customer_name,
        customer_type,
        subtotal: summary.subtotal,
        discount: summary.discount,
        total: summary.total,
        profit: summary.profit,
        payment_method: payment.method,
        payment_amount: payment.amount,
        change: payment.change,
        remaining_amount: payment.remaining,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 3. Insert into sale_items
    const saleItemsToInsert = items.map(item => ({
      transaction_id: transaction.id,
      product_id: item.id,
      quantity: item.quantity,
      buy_price: item.buyPrice,
      sale_price: item.salePrice,
    }));

    const { error: saleItemsError } = await adminSupabaseClient
      .from('sale_items')
      .insert(saleItemsToInsert);

    if (saleItemsError) throw saleItemsError;

    // 4. Update product stock
    for (const item of items) {
      const { error: updateStockError } = await adminSupabaseClient.rpc('decrement_stock', {
        product_id_in: item.id,
        quantity_in: item.quantity
      });
      if (updateStockError) console.error(`Failed to update stock for ${item.id}:`, updateStockError); // Log error but continue
    }

    // 5. Insert into installments if necessary
    if (payment.method === 'cicilan' && payment.remaining > 0) {
      const { error: installmentError } = await adminSupabaseClient
        .from('installments')
        .insert({
          id: transaction.id, // Use transaction id for installment id
          type: 'Penjualan',
          customer_name: customer_name,
          customer_id: customer_id,
          transaction_date: transaction.created_at,
          total_amount: summary.total,
          paid_amount: payment.amount,
          remaining_amount: payment.remaining,
          status: 'Belum Lunas',
          payment_history: [{ date: new Date().toISOString(), amount: payment.amount }],
          details: `${items.length} item(s)`,
        });
      if (installmentError) console.error(`Failed to create installment for ${transaction.id}:`, installmentError);
    }

    return new Response(JSON.stringify({ transaction_id: transaction.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})