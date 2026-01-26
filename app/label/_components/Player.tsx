"use client";
import Image from "next/image";
import { useState } from "react";
import { images } from "../config/images";
import { motion } from "framer-motion";

export default function Player() {
  const [playing, setPlaying] = useState(false);

  return (
    <section aria-label="Lecteur" className="relative py-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="card-surface flex flex-col overflow-hidden rounded-2xl border border-white/10 sm:flex-row"
        >
          <div className="relative h-64 w-full sm:h-60 sm:w-60">
            <Image
              src={images.playerCover}
              alt="Cover art"
              fill
              sizes="(min-width: 640px) 240px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 items-center justify-between gap-6 p-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-200">Nova Echo — Gravity Waves</h3>
              <p className="mt-1 text-sm text-gray-400">OUT NOW · LABEL</p>
            </div>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Lecture"}
              onClick={() => setPlaying((p) => !p)}
              className="ring-focus inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-black transition hover:brightness-110"
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
