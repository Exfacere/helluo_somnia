"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { images } from "../config/images";

export default function Events() {
  return (
    <section aria-label="Événements" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-200">Events</h2>
          <Link
            href="#"
            className="text-sm font-medium text-orange-400 hover:text-orange-300 focus-visible:outline-none ring-focus"
            aria-label="Voir tous les événements"
          >
            Tout voir
          </Link>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {images.events.map((e) => (
            <li key={e.id} className="group">
              <Link href={e.link ?? '#'} aria-label={`${e.title} — ${e.location}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="card-surface overflow-hidden rounded-2xl border border-white/10"
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={e.image}
                      alt={`${e.title} — ${e.location}`}
                      fill
                      sizes="(min-width: 1024px) 45vw, 90vw"
                      className="object-cover transition group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">{e.title}</h3>
                      <p className="text-sm text-gray-400">{e.location}</p>
                    </div>
                    <div className="rounded-md bg-white/5 px-2 py-1 text-xs text-gray-300">
                      {new Date(e.date).toLocaleDateString()}
                    </div>
                  </div>
                </motion.article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
