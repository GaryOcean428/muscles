// Sitemap generation utility
export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export function generateSitemap(baseUrl: string, entries: SitemapEntry[]): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>'
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  const urlsetClose = '</urlset>'
  
  const urls = entries.map(entry => {
    const url = `<url>
    <loc>${baseUrl}${entry.url}</loc>`
    const lastmod = entry.lastModified 
      ? `\n    <lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>`
      : ''
    const changefreq = entry.changeFrequency 
      ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
      : ''
    const priority = entry.priority !== undefined 
      ? `\n    <priority>${entry.priority}</priority>`
      : ''
    
    return `${url}${lastmod}${changefreq}${priority}\n  </url>`
  }).join('\n  ')
  
  return `${header}\n${urlsetOpen}\n  ${urls}\n${urlsetClose}`
}

// Default sitemap entries for the fitness app
export function getDefaultSitemapEntries(): SitemapEntry[] {
  return [
    {
      url: '/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: '/dashboard',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: '/workouts',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: '/fitcraft',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: '/calendar',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: '/subscription',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: '/profile',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ]
}

// Robots.txt generation
export function generateRobotsTxt(baseUrl: string, options: {
  allowAll?: boolean
  disallowPaths?: string[]
  sitemapUrl?: string
  crawlDelay?: number
}): string {
  const { allowAll = true, disallowPaths = [], sitemapUrl, crawlDelay } = options
  
  let robotsTxt = 'User-agent: *\n'
  
  if (allowAll) {
    robotsTxt += 'Allow: /\n'
  }
  
  if (disallowPaths.length > 0) {
    disallowPaths.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`
    })
  }
  
  if (crawlDelay) {
    robotsTxt += `Crawl-delay: ${crawlDelay}\n`
  }
  
  if (sitemapUrl) {
    robotsTxt += `\nSitemap: ${baseUrl}${sitemapUrl}`
  }
  
  return robotsTxt
}

// Generate default robots.txt for the fitness app
export function getDefaultRobotsTxt(baseUrl: string): string {
  return generateRobotsTxt(baseUrl, {
    allowAll: true,
    disallowPaths: ['/api/', '/admin/', '/*.json'],
    sitemapUrl: '/sitemap.xml',
    crawlDelay: 1
  })
}

// Schema.org structured data generators
export function generateWebApplicationSchema(options: {
  name: string
  description: string
  url: string
  applicationCategory: string
  operatingSystem: string
  offers?: {
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    ratingValue: string
    ratingCount: string
  }
  author?: {
    name: string
    type?: string
  }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": options.name,
    "description": options.description,
    "url": options.url,
    "applicationCategory": options.applicationCategory,
    "operatingSystem": options.operatingSystem,
    ...(options.offers && { "offers": { "@type": "Offer", ...options.offers } }),
    ...(options.aggregateRating && { "aggregateRating": { "@type": "AggregateRating", ...options.aggregateRating } }),
    ...(options.author && { "author": { "@type": options.author.type || "Organization", "name": options.author.name } })
  }
}

export function generateWorkoutSchema(workout: {
  name: string
  description: string
  duration: string
  exerciseType: string
  targetMuscleGroups: string[]
  fitnessLevel: string
  equipment?: string[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ExercisePlan",
    "name": workout.name,
    "description": workout.description,
    "duration": workout.duration,
    "exerciseType": workout.exerciseType,
    "targetPopulation": workout.fitnessLevel,
    "bodyLocation": workout.targetMuscleGroups,
    ...(workout.equipment && { "equipment": workout.equipment })
  }
}

export function generateOrganizationSchema(options: {
  name: string
  url: string
  logo?: string
  sameAs?: string[]
  contactPoint?: {
    telephone?: string
    email?: string
    contactType: string
  }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": options.name,
    "url": options.url,
    ...(options.logo && { "logo": options.logo }),
    ...(options.sameAs && { "sameAs": options.sameAs }),
    ...(options.contactPoint && { "contactPoint": { "@type": "ContactPoint", ...options.contactPoint } })
  }
}

// SEO utilities
export function generateMetaKeywords(baseKeywords: string[], pageSpecificKeywords: string[] = []): string {
  const allKeywords = [...new Set([...baseKeywords, ...pageSpecificKeywords])]
  return allKeywords.join(', ')
}

export function generateMetaDescription(content: string, maxLength: number = 160): string {
  if (content.length <= maxLength) {
    return content
  }
  
  const truncated = content.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

export function generateCanonicalUrl(baseUrl: string, path: string, removeTrailingSlash: boolean = true): string {
  const url = `${baseUrl}${path}`
  return removeTrailingSlash && url.endsWith('/') && url !== baseUrl + '/' ? url.slice(0, -1) : url
}

// Core Web Vitals optimization utilities
export function preloadCriticalResources(resources: Array<{ href: string; as: string; type?: string }>) {
  resources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.type) {
      link.type = resource.type
    }
    document.head.appendChild(link)
  })
}

export function prefetchPages(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
}

export function optimizeImages(images: NodeListOf<HTMLImageElement>) {
  // Add loading="lazy" to images below the fold
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (!img.loading) {
          img.loading = 'lazy'
        }
        imageObserver.unobserve(img)
      }
    })
  })
  
  images.forEach(img => {
    imageObserver.observe(img)
  })
}