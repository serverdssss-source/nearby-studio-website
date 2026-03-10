// SEO Configuration for NearBy Studios

export const seoConfig = {
  siteName: "NearBy Studios",
  siteUrl: "https://www.nearbystudios.in",
  defaultTitle: "Studio Rental in Bengaluru | NearBy Studios - Best Rates",
  defaultDescription: "Looking for affordable studio rental in Bengaluru? NearBy Studios offers premium space for model shoots, podcasts, reels & content creation at best prices.",
  defaultKeywords: [
    "studio rental Bengaluru",
    "studio rental Bangalore",
    "podcast studio Bengaluru",
    "model shoot studio Bangalore",
    "content creation studio",
    "photography studio rental Bengaluru",
    "video production studio Bangalore",
    "studio for rent Bangalore",
    "affordable studio space Bengaluru",
    "professional studio Bengaluru",
    "studio booking Bangalore",
    "reels studio Bengaluru",
    "YouTube studio rental",
    "green screen studio Bangalore",
    "product photography studio"
  ],
  
  // Business Information
  business: {
    name: "NearBy Studios",
    phone: "+91-XXXXXXXXXX", // Replace with actual phone
    email: "info@nearbystudios.in",
    address: {
      street: "Your Street Address",
      city: "Bengaluru",
      state: "Karnataka",
      zip: "560XXX",
      country: "India"
    },
    coordinates: {
      lat: 12.9716,
      lng: 77.5946
    },
    hours: "Mon-Sun: 9:00 AM - 9:00 PM"
  },
  
  // Social Media Links
  social: {
    facebook: "https://www.facebook.com/nearbystudios",
    instagram: "https://www.instagram.com/nearbystudios",
    linkedin: "https://www.linkedin.com/company/nearbystudios",
    youtube: "https://www.youtube.com/@nearbystudios"
  },
  
  // Page-specific SEO
  pages: {
    home: {
      title: "Studio Rental in Bengaluru | NearBy Studios - Best Rates",
      description: "Looking for affordable studio rental in Bengaluru? NearBy Studios offers premium space for model shoots, podcasts, reels & content creation at best prices.",
      keywords: "studio rental Bengaluru, podcast studio, model shoot studio, content creation studio Bangalore",
      canonical: "https://www.nearbystudios.in/"
    },
    
    podcastStudio: {
      title: "Podcast Studio in Bengaluru | Professional Recording Space",
      description: "Book our premium podcast studio in Bengaluru with soundproof rooms, professional mics & equipment. Perfect for podcasters, YouTubers & content creators.",
      keywords: "podcast studio Bengaluru, podcast recording studio, audio recording studio Bangalore, soundproof studio",
      canonical: "https://www.nearbystudios.in/podcast-studio"
    },
    
    modelShoot: {
      title: "Model Shoot Studio in Bengaluru | Fashion Photography Space",
      description: "Professional model shoot studio in Bengaluru with premium lighting, backdrops & equipment. Ideal for fashion shoots, portfolio shoots & brand campaigns.",
      keywords: "model shoot studio Bengaluru, fashion photography studio, portfolio shoot studio Bangalore, modeling studio",
      canonical: "https://www.nearbystudios.in/model-shoot-studio"
    },
    
    contentCreation: {
      title: "Content Creation Studio Bengaluru | Reels & Video Production",
      description: "Rent our content creation studio in Bengaluru for Instagram reels, YouTube videos & social media content. Equipped with lights, cameras & props.",
      keywords: "content creation studio Bengaluru, reels studio, YouTube studio, video production studio Bangalore",
      canonical: "https://www.nearbystudios.in/content-creation-studio"
    },
    
    videoProduction: {
      title: "Video Production Studio in Bengaluru | Professional Filming",
      description: "Full-service video production studio in Bengaluru with 4K cameras, lighting & editing facilities. Perfect for commercials, corporate videos & films.",
      keywords: "video production studio Bengaluru, filming studio Bangalore, commercial video studio, corporate video production",
      canonical: "https://www.nearbystudios.in/video-production-studio"
    },
    
    contact: {
      title: "Contact NearBy Studios | Book Studio in Bengaluru",
      description: "Contact NearBy Studios to book your studio session in Bengaluru. Call us or fill the form for instant booking. Best rates guaranteed!",
      keywords: "book studio Bengaluru, studio booking Bangalore, contact studio rental",
      canonical: "https://www.nearbystudios.in/contact"
    }
  }
};

// FAQ Schema Data
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the cost of studio rental in Bengaluru?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Studio rental at NearBy Studios starts from affordable hourly rates. Prices vary based on studio type, duration, and equipment needs. Contact us for detailed pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide equipment with the studio rental?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all our studios come equipped with professional lighting, cameras, microphones, and other necessary equipment. Additional equipment can be arranged on request."
      }
    },
    {
      "@type": "Question",
      "name": "Can I book the studio for a full day?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer flexible booking options including hourly, half-day, and full-day packages. Full-day bookings come with special discounted rates."
      }
    },
    {
      "@type": "Question",
      "name": "Is parking available at the studio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we provide free parking facilities for all our clients at the studio premises in Bengaluru."
      }
    },
    {
      "@type": "Question",
      "name": "What types of shoots can I do at NearBy Studios?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can do podcast recordings, model shoots, fashion photography, product photography, YouTube videos, Instagram reels, corporate videos, and any other content creation at our studios."
      }
    }
  ]
};

// Breadcrumb Schema Generator
export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};
