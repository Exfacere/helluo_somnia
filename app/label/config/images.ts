export type ReleaseImage = {
  id: string;
  cover: string; // URL
  artist: string;
  title: string;
  date: string;
  link: string; // external streaming/purchase link
};

export type ArtistImage = {
  id: string;
  name: string;
  role?: string;
  avatar: string; // URL
  link?: string;
};

export type NewsImage = {
  id: string;
  title: string;
  image: string; // URL
  excerpt?: string;
  link: string;
  date?: string;
};

export type EventImage = {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string; // URL
  link?: string;
};

export const images = {
  // Global/branding
  logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
  favicon: 'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=64&auto=format&fit=crop',

  // Hero section
  heroBackground:
    'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=2400&auto=format&fit=crop',
  heroForeground:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',

  // Player
  playerCover:
    'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop',

  // Releases grid
  releases: [
    {
      id: 'rel-001',
      cover:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop',
      artist: 'Nova Echo',
      title: 'Gravity Waves EP',
      date: '2025-06-21',
      link: 'https://open.spotify.com/'
    },
    {
      id: 'rel-002',
      cover:
        'https://images.unsplash.com/photo-1521550837150-4b79a48cbf2c?q=80&w=1000&auto=format&fit=crop',
      artist: 'Kairo',
      title: 'Neon Dunes',
      date: '2025-04-12',
      link: 'https://music.apple.com/'
    },
    {
      id: 'rel-003',
      cover:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      artist: 'Asteria',
      title: 'Chromatic',
      date: '2025-02-28',
      link: 'https://bandcamp.com/'
    }
  ] as ReleaseImage[],

  // Roster/Artists
  roster: [
    {
      id: 'art-001',
      name: 'Nova Echo',
      role: 'Producer / Live',
      avatar:
        'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=600&auto=format&fit=crop',
      link: '#'
    },
    {
      id: 'art-002',
      name: 'Kairo',
      role: 'DJ / Techno',
      avatar:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=600&auto=format&fit=crop',
      link: '#'
    },
    {
      id: 'art-003',
      name: 'Asteria',
      role: 'Singer / Synth',
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
      link: '#'
    }
  ] as ArtistImage[],

  // News
  news: [
    {
      id: 'news-001',
      title: 'Signing announcement: Asteria joins Label',
      image:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'We are thrilled to welcome Asteria to our roster.',
      link: '#',
      date: '2025-07-10'
    },
    {
      id: 'news-002',
      title: 'New release: Gravity Waves EP out now',
      image:
        'https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Dive into cosmic textures and tectonic grooves by Nova Echo.',
      link: '#',
      date: '2025-06-21'
    }
  ] as NewsImage[],

  // Events
  events: [
    {
      id: 'evt-001',
      title: 'Label Night — Berlin',
      date: '2025-09-20',
      location: 'Berghain, Berlin',
      image:
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1400&auto=format&fit=crop',
      link: '#'
    },
    {
      id: 'evt-002',
      title: 'Showcase — Paris',
      date: '2025-10-04',
      location: 'Rex Club, Paris',
      image:
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1400&auto=format&fit=crop',
      link: '#'
    }
  ] as EventImage[],

  // Newsletter / decorative
  newsletterIllustration:
    'https://images.unsplash.com/photo-1507878866276-a947ef722fee?q=80&w=1200&auto=format&fit=crop',

  // Socials
  socials: {
    instagram: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    twitter: 'https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg',
    spotify: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
  }
} as const;

export type ImagesConfig = typeof images;
