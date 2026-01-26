"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { images } from "../config/images";

export default function News() {
  return (
    <section aria-label="Actualités" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-200">News</h2>
          <Link
            href="#"
            className="text-sm font-medium text-orange-400 hover:text-orange-300 focus-visible:outline-none ring-focus"
            aria-label="Voir toutes les news"
          >
            Tout voir
          </Link>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {images.news.map((n) => (
            <li key={n.id} className="group">
              <Link href={n.link} aria-label={n.title}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="card-surface overflow-hidden rounded-2xl border border-white/10"
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={n.image}
                      alt={n.title}
                      fill
                      sizes="(min-width: 1024px) 45vw, 90vw"
                      className="object-cover transition group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500">{n.date && new Date(n.date).toLocaleDateString()}</p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-200">{n.title}</h3>
                    {n.excerpt && <p className="mt-2 line-clamp-2 text-sm text-gray-400">{n.excerpt}</p>}
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
