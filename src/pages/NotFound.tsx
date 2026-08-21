import { ButtonLink } from "@/components/ui/Button";
import { SeoHead } from "@/components/layout/SeoHead";

export default function NotFound() {
  return (
    <>
      <SeoHead title="Page Not Found" description="This page could not be found." path="/404" />
      <div className="container-editorial flex min-h-screen flex-col items-center justify-center text-center">
        <p className="font-sans text-xs uppercase tracking-[0.24em] text-warmgray">404</p>
        <h1 className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">This page has not been found.</h1>
        <p className="mt-4 max-w-sm font-sans text-warmgray-dark">
          The page you're looking for may have moved, or never existed.
        </p>
        <ButtonLink to="/" className="mt-8">
          Return Home
        </ButtonLink>
      </div>
    </>
  );
}
