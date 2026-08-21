import { useCart, type CartLine } from "@/context/CartContext";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatPrice } from "@/lib/utils/format";

export function CartLineItem({ line }: { line: CartLine }) {
  const { increment, decrement, removeItem } = useCart();

  return (
    <li className="flex gap-4 py-5">
      <div className="h-24 w-20 shrink-0 overflow-hidden bg-stone">
        <img src={line.image} alt={line.title} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-serif text-base leading-snug">{line.title}</p>
          {line.variant && <p className="mt-0.5 text-xs text-warmgray">{line.variant}</p>}
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            quantity={line.quantity}
            onIncrement={() => increment(line.id)}
            onDecrement={() => decrement(line.id)}
            label={`Quantity for ${line.title}`}
          />
          <span className="font-sans text-sm">{formatPrice(line.price * line.quantity)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeItem(line.id)}
        className="self-start font-sans text-[11px] uppercase tracking-wide text-warmgray underline-offset-2 hover:text-charcoal hover:underline"
        aria-label={`Remove ${line.title} from cart`}
      >
        Remove
      </button>
    </li>
  );
}
