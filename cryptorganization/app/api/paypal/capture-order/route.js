import { createClient } from "@/lib/supabase/server";
import { capturePayPalOrder } from "@/lib/paypal";
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

    const { orderId } =
      await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order ID." },
        { status: 400 }
      );
    }

    const { data: payment, error } =
      await supabase
        .from("payments")
        .select("*")
        .eq("provider_order_id", orderId)
        .eq("user_id", user.id)
        .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 }
      );
    }

    if (payment.status === "completed") {
      return NextResponse.json({
        success: true,
        status: "completed",
      });
    }

    const capture =
      await capturePayPalOrder(orderId);

    const captureUnit =
      capture.purchase_units?.[0];

    const captureRecord =
      captureUnit?.payments?.captures?.[0];

    if (
      capture.status !== "COMPLETED" ||
      captureRecord?.status !== "COMPLETED"
    ) {
      await supabase
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("id", payment.id);

      return NextResponse.json(
        { error: "Payment was not completed." },
        { status: 400 }
      );
    }

    const capturedAmount =
      captureRecord.amount?.value;

    const capturedCurrency =
      captureRecord.amount?.currency_code;

    if (
      Number(capturedAmount) !==
        Number(payment.amount) ||
      capturedCurrency !== payment.currency
    ) {
      await supabase
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("id", payment.id);

      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    const { error: updateError } =
      await supabase
        .from("payments")
        .update({
          status: "completed",
          provider_capture_id:
            captureRecord.id,
        })
        .eq("id", payment.id)
        .eq("status", "created");

    if (updateError) {
      return NextResponse.json(
        { error: "Unable to finalize payment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "completed",
    });
  } catch {
    return NextResponse.json(
      { error: "Payment processing failed." },
      { status: 500 }
    );
  }
}