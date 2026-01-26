"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { images } from "../config/images";

export default function Releases() {
  return (
    <section id="releases" aria-label="Dernières releases" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-200">Releases</h2>
          <Link
            href="#"
            className="text-sm font-medium text-orange-400 hover:text-orange-300 focus-visible:outline-none ring-focus"
            aria-label="Voir toutes les releases"
          >
            Tout voir
          </Link>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.releases.map((rel) => (
            <li key={rel.id} className="group">
              <Link href={rel.link} aria-label={`Écouter ${rel.title} par ${rel.artist}`} target="_blank" rel="noopener noreferrer">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="card-surface rounded-2xl border border-white/10 p-3"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <Image
                      src={rel.cover}
                      alt={`${rel.title} cover — ${rel.artist}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition will-change-transform group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="px-1 pb-2 pt-4">
                    <p className="text-sm text-gray-400">{rel.artist}</p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-200">{rel.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{new Date(rel.date).toLocaleDateString()}</p>
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
