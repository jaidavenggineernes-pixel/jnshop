import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdsParam = searchParams.get("productIds");
    const amountParam = parseFloat(searchParams.get("amount") || "0");
    const hasDigitalParam = searchParams.get("hasDigital") === "true";

    // 1. Fetch active payment methods ordered by displayOrder
    const methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    // 2. If product IDs are provided, inspect products for payment restrictions
    let hasDigitalItem = hasDigitalParam;
    let anyProductDisallowsCod = false;
    let disallowCodReasons: string[] = [];
    const productRestrictionsMap: { [productId: string]: string[] } = {};

    if (productIdsParam) {
      const ids = productIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            name: true,
            isPhysical: true,
            allowCod: true,
            allowedPaymentMethods: true,
          },
        });

        for (const p of products) {
          if (!p.isPhysical) {
            hasDigitalItem = true;
            anyProductDisallowsCod = true;
            disallowCodReasons.push(`Produk digital: "${p.name}"`);
          } else if (!p.allowCod) {
            anyProductDisallowsCod = true;
            disallowCodReasons.push(`Produk fisik tanpa COD: "${p.name}"`);
          }

          if (p.allowedPaymentMethods) {
            try {
              const allowed = JSON.parse(p.allowedPaymentMethods);
              if (Array.isArray(allowed)) {
                productRestrictionsMap[p.id] = allowed;
              }
            } catch {
              // fallback comma separated
              productRestrictionsMap[p.id] = p.allowedPaymentMethods.split(",").map((x) => x.trim());
            }
          }
        }
      }
    }

    // 3. Map methods with eligibility evaluation
    const processedMethods = methods.map((m) => {
      let isAvailable = true;
      let restrictionReason: string | null = null;

      // Rule A: COD is strictly prohibited for digital goods or products with allowCod: false
      if (m.code === "COD") {
        if (hasDigitalItem || anyProductDisallowsCod) {
          isAvailable = false;
          restrictionReason =
            disallowCodReasons.length > 0
              ? `COD dinonaktifkan karena keranjang Anda memuat: ${disallowCodReasons.join(", ")}.`
              : "COD tidak tersedia untuk produk digital demi keamanan transaksi.";
        } else if (m.maxAmount && amountParam > m.maxAmount) {
          isAvailable = false;
          restrictionReason = `Batas maksimal COD adalah Rp ${m.maxAmount.toLocaleString("id-ID")}. Total belanja Anda Rp ${amountParam.toLocaleString("id-ID")}.`;
        }
      }

      // Rule B: Check if any product specifically restricts this payment method
      for (const [prodId, allowedList] of Object.entries(productRestrictionsMap)) {
        if (allowedList && allowedList.length > 0 && !allowedList.includes(m.code)) {
          isAvailable = false;
          restrictionReason = `Salah satu produk yang dipilih hanya menerima metode: ${allowedList.join(", ")}.`;
          break;
        }
      }

      return {
        id: m.id,
        code: m.code,
        name: m.name,
        type: m.type,
        description: m.description,
        instructions: m.instructions,
        accountName: m.accountName,
        accountNumber: m.accountNumber,
        logoUrl: m.logoUrl,
        qrCodeUrl: m.qrCodeUrl,
        minAmount: m.minAmount,
        maxAmount: m.maxAmount,
        isForPhysicalOnly: m.isForPhysicalOnly,
        isAvailable,
        restrictionReason,
      };
    });

    return NextResponse.json({
      success: true,
      methods: processedMethods,
      rules: {
        hasDigitalItem,
        anyProductDisallowsCod,
      },
    });
  } catch (error) {
    console.error("Fetch payment methods error:", error);
    return NextResponse.json(
      { error: "Gagal memuat metode pembayaran" },
      { status: 500 }
    );
  }
}
