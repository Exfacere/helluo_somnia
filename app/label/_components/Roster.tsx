"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { images } from "../config/images";

export default function Roster() {
  return (
    <section id="roster" aria-label="Roster" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-200">Roster</h2>
          <Link
            href="#"
            className="text-sm font-medium text-orange-400 hover:text-orange-300 focus-visible:outline-none ring-focus"
            aria-label="Voir tout le roster"
          >
            Tout voir
          </Link>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.roster.map((artist) => (
            <li key={artist.id} className="group">
              <Link href={artist.link ?? '#'} aria-label={`Voir ${artist.name}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="card-surface rounded-2xl border border-white/10 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                      <Image
                        src={artist.avatar}
                        alt={`${artist.name} portrait`}
                        fill
                        sizes="64px"
                        className="object-cover transition group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-200">{artist.name}</h3>
                      {artist.role && <p className="truncate text-sm text-gray-400">{artist.role}</p>}
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
