export async function createPayPalOrder(data) {
  // Netlify serverless / API handler call for PayPal Order Creation
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export async function capturePayPalOrder(orderId) {
  // Netlify serverless / API handler call for PayPal Order Capture
  const response = await fetch('/api/paypal/capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  return await response.json();
}
