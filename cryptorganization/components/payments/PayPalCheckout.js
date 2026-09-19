"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";

export default function PayPalCheckout({
  amount,
}) {
  return (
    <PayPalScriptProvider
      options={{
        clientId:
          process.env
            .NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
        }}
        createOrder={async () => {
          const response = await fetch(
            "/api/paypal/create-order",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                amount,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Unable to create order."
            );
          }

          return data.orderID;
        }}
        onApprove={async (data) => {
          const response = await fetch(
            "/api/paypal/capture-order",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderID,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(
              "Payment verification failed."
            );
          }

          window.location.reload();
        }}
      />
    </PayPalScriptProvider>
  );
}