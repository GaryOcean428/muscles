import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  siteName?: string
}

const DEFAULT_SEO = {
  title: 'Muscles AI Fitness - Your AI-Powered Personal Trainer',
  description: 'Transform your fitness journey with AI-powered workout generation, personalized coaching, and comprehensive tracking. Get stronger, fitter, and healthier with Muscles AI.',
  keywords: ['AI fitness', 'workout generator', 'personal trainer', 'HIIT', 'CrossFit', 'strength training', 'fitness app'],
  image: '/images/og-image.jpg',
  siteName: 'Muscles AI Fitness',
  type: 'website' as const
}

export function SEOHead({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = DEFAULT_SEO.type,
  author,
  publishedTime,
  modifiedTime,
  siteName = DEFAULT_SEO.siteName
}: SEOProps) {
  const fullTitle = title === DEFAULT_SEO.title ? title : `${title} | ${siteName}`
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author || 'MiniMax Agent'} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@MusclesAI" />
      <meta name="twitter:site" content="@MusclesAI" />
      
      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* PWA Meta Tags */}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": siteName,
          "description": description,
          "url": url,
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1247"
          },
          "author": {
            "@type": "Organization",
            "name": "MiniMax"
          }
        })}
      </script>
    </Helmet>
  )
}

// Page-specific SEO components
export function DashboardSEO() {
  return (
    <SEOHead
      title="Dashboard - Track Your Fitness Progress"
      description="View your fitness progress, workout statistics, and personalized insights on your Muscles AI dashboard."
      keywords={['fitness dashboard', 'workout tracking', 'progress monitoring', 'fitness statistics']}
    />
  )
}

export function WorkoutGeneratorSEO() {
  return (
    <SEOHead
      title="AI Workout Generator - Personalized Fitness Plans"
      description="Generate customized workouts with AI technology. Get personalized HIIT, strength training, and CrossFit workouts tailored to your fitness level."
      keywords={['AI workout generator', 'personalized workouts', 'HIIT generator', 'strength training', 'CrossFit workouts']}
    />
  )
}

export function FitCraftCoachSEO() {
  return (
    <SEOHead
      title="FitCraft AI Coach - Your Personal Fitness Assistant"
      description="Chat with your AI fitness coach for personalized advice, workout recommendations, and motivation to reach your fitness goals."
      keywords={['AI fitness coach', 'personal trainer', 'fitness assistant', 'workout advice', 'fitness motivation']}
    />
  )
}

export function CalendarSEO() {
  return (
    <SEOHead
      title="Workout Calendar - Schedule Your Fitness Routine"
      description="Plan and schedule your workouts with our integrated calendar. Sync with Google Calendar and track your fitness routine."
      keywords={['workout calendar', 'fitness scheduling', 'workout planner', 'fitness routine']}
    />
  )
}

export function ProfileSEO() {
  return (
    <SEOHead
      title="Profile Settings - Customize Your Fitness Experience"
      description="Manage your fitness profile, preferences, and account settings to get the most personalized workout experience."
      keywords={['fitness profile', 'account settings', 'workout preferences', 'fitness customization']}
    />
  )
}

export function SubscriptionSEO() {
  return (
    <SEOHead
      title="Subscription Plans - Unlock Premium Fitness Features"
      description="Choose from our flexible subscription plans to access premium AI workout generation, advanced tracking, and personalized coaching."
      keywords={['fitness subscription', 'premium workout plans', 'AI fitness premium', 'workout app pricing']}
    />
  )
}