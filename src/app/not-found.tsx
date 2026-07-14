import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen items-center bg-gt-cream px-6 py-16">
      <section className="mx-auto max-w-xl text-center">
        <p className="eyebrow">404 · Page not found</p>
        <h1 className="mt-4 text-4xl font-black text-gt-navy">This page is not part of the chapter site.</h1>
        <p className="mt-5 leading-8 text-slate-600">
          The link may be outdated, or the resource may not have been published yet.
        </p>
        <Link href="/" className="button button-primary mt-8">
          Return home
        </Link>
      </section>
    </main>
  );
}
