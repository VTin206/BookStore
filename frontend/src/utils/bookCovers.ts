// Curated high quality covers and deterministic aesthetic book cover generator

const CURATED_COVERS: Record<string, string> = {
  'dac-nhan-tam': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'nha-gia-kim': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'clean-code': 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?auto=format&fit=crop&w=600&q=80',
  'atomic-habits': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
  'sapiens': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  'tu-duy-nhanh-va-cham': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
  'triet-hoc': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
  'kinh-te': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
  'cong-nghe': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  'van-hoc': 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
};

const PALETTES = [
  { bg: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', text: '#ffffff', accent: '#60a5fa' },
  { bg: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)', text: '#ffffff', accent: '#34d399' },
  { bg: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)', text: '#ffffff', accent: '#fb923c' },
  { bg: 'linear-gradient(135deg, #581c87 0%, #2e1065 100%)', text: '#ffffff', accent: '#c084fc' },
  { bg: 'linear-gradient(135deg, #831843 0%, #500724 100%)', text: '#ffffff', accent: '#f472b6' },
  { bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', text: '#ffffff', accent: '#94a3b8' },
];

export function getBookCover(title: string, categoryName?: string, customUrl?: string): string {
  if (customUrl && customUrl.startsWith('http')) {
    return customUrl;
  }

  // Normalize string for checking curated
  const normalized = title.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-');

  for (const [key, url] of Object.entries(CURATED_COVERS)) {
    if (normalized.includes(key)) {
      return url;
    }
  }

  if (categoryName) {
    const catNorm = categoryName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '-');
    for (const [key, url] of Object.entries(CURATED_COVERS)) {
      if (catNorm.includes(key)) {
        return url;
      }
    }
  }

  // Default fallback image from unsplash book collection
  const hash = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const stockCovers = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?auto=format&fit=crop&w=600&q=80',
  ];

  return stockCovers[hash % stockCovers.length];
}

export function getBookPalette(title: string) {
  const hash = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return PALETTES[hash % PALETTES.length];
}
