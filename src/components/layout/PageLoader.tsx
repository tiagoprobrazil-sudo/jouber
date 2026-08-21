export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border border-stone-dark border-t-olive" aria-label="Loading" role="status" />
    </div>
  );
}
