"use client";
import Image from "next/image";
import { images } from "../config/images";

export default function Newsletter() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);    console.log("newsletter", Object.fromEntries(data.entries()));
  }

  return (
    <section aria-label="Newsletter" className="relative py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="card-surface overflow-hidden rounded-2xl border border-white/10">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-semibold text-gray-200">Restez informé·e</h2>
              <p className="mt-2 text-sm text-gray-400">
                Sorties, dates et exclusivités. Zéro spam.
              </p>
              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="nl-email">Email</label>
                <input
                  id="nl-email"
                  name="email"
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  className="ring-focus w-full flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-200 placeholder-gray-500 focus-visible:outline-none"
                />
                <button
                  type="submit"
                  className="ring-focus inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  S'abonner
                </button>
              </form>
            </div>
            <div className="relative hidden min-h-[260px] md:block">
              <Image
                src={images.newsletterIllustration}
                alt="Newsletter visual"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
