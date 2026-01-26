"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { images } from "../config/images";
import Link from "next/link";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yFg = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      ref={ref}
      aria-label="Hero — Label"
      className="relative isolate overflow-hidden bg-label-dark text-gray-200"
    >
      
      <motion.div style={{ y: yBg }} aria-hidden className="absolute inset-0 -z-10">
        
        <Image
          src={images.heroBackground}
          alt="Background texture"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
      </motion.div>

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-24 sm:pt-32 sm:pb-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl"
            >
              LABEL — Sonic architectures for the night
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="max-w-xl text-lg leading-relaxed text-gray-400"
            >
              Un label de musique à l’esthétique dark et contemporaine. Roster sélectif, releases avant-gardistes, expériences
              scéniques. Explorez les dernières sorties et nos artistes.
            </motion.p>

            <div className="flex items-center gap-4">
              <Link
                href="#releases"
                aria-label="Voir les dernières sorties"
                className="ring-focus inline-flex items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline-none"
              >
                Explorer les releases
              </Link>
              <Link
                href="#roster"
                aria-label="Découvrir le roster"
                className="ring-focus inline-flex items-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
              >
                Découvrir le roster
              </Link>
            </div>
          </div>

          <motion.div
            style={{ y: yFg }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          >
            <Image
              src={images.heroForeground}
              alt="Visual of the label mood"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
