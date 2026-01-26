import Hero from "./_components/Hero";
import Releases from "./_components/Releases";
import Roster from "./_components/Roster";
import Player from "./_components/Player";
import News from "./_components/News";
import Events from "./_components/Events";
import Newsletter from "./_components/Newsletter";
import Footer from "./_components/Footer";
import "./styles/gradients.css";
import { metadata as labelMetadata, jsonLd } from "./config/meta";

export const metadata = labelMetadata;

export default function LabelPage() {
  return (
    <main className="min-h-screen bg-label-dark text-gray-200">
            <script
        type="application/ld+json"        dangerouslySetInnerHTML={{ __html: jsonLd() }}
      />

      <Hero />
      <Releases />
      <Player />
      <Roster />
      <News />
      <Events />
      <Newsletter />
      <Footer />
    </main>
  );
}
