import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QuantityStepper({ quantity, onIncrement, onDecrement, min = 1, max, label }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center border border-stone-dark" role="group" aria-label={label ?? "Quantity"}>
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:bg-stone disabled:opacity-30"
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className="flex h-10 w-10 items-center justify-center text-sm tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={max != null && quantity >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:bg-stone disabled:opacity-30"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
