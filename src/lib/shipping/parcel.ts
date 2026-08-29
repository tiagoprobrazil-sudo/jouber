import type { CartLine } from "@/context/CartContext";
import { DEFAULT_PARCEL, type Parcel } from "@/lib/shipping/types";

function lineParcel(line: CartLine): Parcel {
  const { shippingWeightOz, shippingLengthIn, shippingWidthIn, shippingHeightIn } = line;
  if (!shippingWeightOz || !shippingLengthIn || !shippingWidthIn || !shippingHeightIn) {
    return DEFAULT_PARCEL;
  }
  return {
    weightOz: shippingWeightOz,
    lengthIn: shippingLengthIn,
    widthIn: shippingWidthIn,
    heightIn: shippingHeightIn,
  };
}

/**
 * Combines every cart line into a single shippable parcel: weights sum,
 * and the box is sized to the largest single item's footprint stacked to
 * the summed height. This is a deliberate simplification (real multi-box
 * packing is a much harder problem) — good enough for a small atelier's
 * typical 1-3 item orders. Revisit if orders regularly mix many large items.
 */
export function combineCartParcel(lines: CartLine[]): Parcel {
  if (lines.length === 0) return DEFAULT_PARCEL;

  let weightOz = 0;
  let lengthIn = 0;
  let widthIn = 0;
  let heightIn = 0;

  for (const line of lines) {
    const parcel = lineParcel(line);
    weightOz += parcel.weightOz * line.quantity;
    lengthIn = Math.max(lengthIn, parcel.lengthIn);
    widthIn = Math.max(widthIn, parcel.widthIn);
    heightIn += parcel.heightIn * line.quantity;
  }

  return { weightOz, lengthIn, widthIn, heightIn };
}
