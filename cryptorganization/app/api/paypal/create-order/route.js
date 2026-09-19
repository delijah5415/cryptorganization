import { createClient } from "@/lib/supabase/server";
import { createPayPalOrder } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const amount = Number(body.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 100000
    ) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order =
      await createPayPalOrder({
        amount,
        currency: "USD",
      });

    const { error } =
      await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          provider: "paypal",
          provider_order_id: order.id,
          amount,
          currency: "USD",
          status: "created",
        });

    if (error) {
      return NextResponse.json(
        { error: "Unable to record payment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderID: order.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Payment service unavailable." },
      { status: 500 }
    );
  }
}