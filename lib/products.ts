export interface Product {
  id: number
  slug: string
  name: string
  description: string
  longDescription: string
  oldPrice: number
  price: number
  installments: number
  installmentPrice: number
  image: string
  images: string[]
  badge?: string
  category: string
  details: string[]
}

export const products: Product[] = [
  {
    id: 1,
    slug: "quarteto-blush-glow-essencial",
    name: "Quarteto de Blush Glow Essencial 7,2g",
    description: "4 tons perfeitos para um glow natural",
    longDescription: "O Quarteto de Blush Glow Essencial traz 4 tons perfeitos para criar um glow natural e radiante. Com textura sedosa e alta pigmentação, proporciona um acabamento impecável que dura o dia todo. Ideal para todos os tipos de pele, suas cores versáteis permitem criar desde looks mais naturais até produções mais elaboradas.",
    oldPrice: 115.00,
    price: 69.90,
    installments: 6,
    installmentPrice: 11.65,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wqGOWGYTLR8W10Z8MYQdycnN4GYK4O.png",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wqGOWGYTLR8W10Z8MYQdycnN4GYK4O.png",
    ],
    badge: "novo",
    category: "Rosto",
    details: [
      "Peso: 7,2g",
      "4 cores em uma paleta",
      "Textura sedosa",
      "Alta pigmentação",
      "Longa duração",
      "Vegano e cruelty-free",
    ],
  },
  {
    id: 2,
    slug: "lip-oil-marshmallow",
    name: "Lip Oil Marshmallow Hidratação e Brilho 3,5g",
    description: "hidratação intensa com brilho irresistível",
    longDescription: "O Lip Oil Marshmallow oferece hidratação intensa enquanto deixa seus lábios com um brilho irresistível. Sua fórmula enriquecida com óleos naturais nutre profundamente, deixando os lábios macios e saudáveis. O delicioso aroma de marshmallow torna a experiência ainda mais especial.",
    oldPrice: 79.90,
    price: 49.90,
    installments: 6,
    installmentPrice: 8.32,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yrJ4dFeoKdrF7YwphRYl15vlK5RoIP.png",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yrJ4dFeoKdrF7YwphRYl15vlK5RoIP.png",
    ],
    category: "Lábios",
    details: [
      "Conteúdo: 3,5g | 0.12 oz",
      "Hidratação intensa",
      "Brilho natural",
      "Aroma de marshmallow",
      "Fórmula nutritiva",
      "Vegano e cruelty-free",
    ],
  },
  {
    id: 3,
    slug: "body-splash-obsessed-lovely",
    name: "Body Splash Obsessed Lovely 200ml",
    description: "uma declaração de amor em cada borrifada",
    longDescription: "O Body Splash Obsessed Lovely é uma verdadeira declaração de amor em cada borrifada. Com fragrância delicada e envolvente, combina notas florais e frutadas que deixam uma sensação de frescor duradouro. Perfeito para o uso diário, proporciona um toque de elegância e feminilidade.",
    oldPrice: 115.00,
    price: 33.90,
    installments: 6,
    installmentPrice: 5.65,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MjgNcrLP6QH8SdMXKcDvxBAZ3fteiV.png",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MjgNcrLP6QH8SdMXKcDvxBAZ3fteiV.png",
    ],
    badge: "best seller",
    category: "Perfumaria",
    details: [
      "Volume: 200ml | 6.76 fl. oz",
      "Fragrância floral frutada",
      "Longa duração",
      "Frescor duradouro",
      "Uso diário",
      "Cuidado essencial",
    ],
  },
  {
    id: 4,
    slug: "heaven-blue-desodorante-colonia",
    name: "Heaven Blue Desodorante Colônia 100ml",
    description: "fragrância sofisticada da coleção extraordinária",
    longDescription: "O Heaven Blue faz parte da Extraordinary Collection, uma linha premium de fragrâncias sofisticadas. Com notas marcantes e elegantes, este desodorante colônia é perfeito para quem busca uma fragrância única e memorável. Sua fórmula de alta qualidade garante fixação prolongada.",
    oldPrice: 329.00,
    price: 189.90,
    installments: 6,
    installmentPrice: 31.65,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yFD2sidoxxtWqGe1b0UZYJtDrWvmZn.png",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yFD2sidoxxtWqGe1b0UZYJtDrWvmZn.png",
    ],
    badge: "best seller",
    category: "Perfumaria",
    details: [
      "Volume: 100ml | 3.38 fl. oz",
      "Extraordinary Collection",
      "Fragrância sofisticada",
      "Alta fixação",
      "Embalagem premium",
      "Edição especial",
    ],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getRelatedProducts(currentId: number, limit = 4): Product[] {
  return products.filter((p) => p.id !== currentId).slice(0, limit)
}
