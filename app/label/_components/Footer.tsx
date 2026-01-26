import Image from "next/image";
import Link from "next/link";
import { images } from "../config/images";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 text-gray-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <div className="relative h-6 w-6">
            <Image src={images.logo} alt="Label logo" fill sizes="24px" className="object-cover rounded" />
          </div>
          <span>© {new Date().getFullYear()} Label. Tous droits réservés.</span>
        </div>
        <nav aria-label="Réseaux sociaux" className="flex items-center gap-4">
          <Link href="#" aria-label="Instagram" className="ring-focus rounded p-1 hover:opacity-80">
            <Image src={images.socials.instagram} alt="Instagram" width={20} height={20} />
          </Link>
          <Link href="#" aria-label="Twitter/X" className="ring-focus rounded p-1 hover:opacity-80">
            <Image src={images.socials.twitter} alt="Twitter/X" width={20} height={20} />
          </Link>
          <Link href="#" aria-label="Spotify" className="ring-focus rounded p-1 hover:opacity-80">
            <Image src={images.socials.spotify} alt="Spotify" width={20} height={20} />
          </Link>
        </nav>
      </div>
    </footer>
  );
}
