export interface Package {
  id: string
  name: string
  duration: number // in hours
  price: number
  description: string
  includes: string[]
}

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  available: boolean
}

export interface ClientDetails {
  name: string
  email: string
  phone: string
  companyName?: string
  gstNumber?: string
  notes?: string
}

export interface BookingSummary {
  package: Package
  date: Date
  timeSlot: TimeSlot
  clientDetails: ClientDetails
  subtotal: number
  gst: number
  total: number
}

export const packages: Package[] = [
  {
    id: "podcast",
    name: "Podcast Recording",
    duration: 2,
    price: 3000,
    description: "Perfect for podcast creators and interview sessions",
    includes: [
      "Studio room access",
      "3 professional microphones",
      "Audio recording setup",
      "Sound engineer assistance",
    ],
  },
  {
    id: "video",
    name: "Video Production",
    duration: 4,
    price: 8000,
    description: "Full video production setup with professional lighting",
    includes: [
      "Studio room access",
      "4K camera setup",
      "Professional lighting",
      "Green screen available",
      "Video engineer support",
    ],
  },
  {
    id: "voiceover",
    name: "Voice Over",
    duration: 1,
    price: 1500,
    description: "Professional voice-over recording booth",
    includes: [
      "Sound-isolated booth",
      "Professional microphone",
      "Audio processing",
      "Quick turnaround",
    ],
  },
  {
    id: "music",
    name: "Music Recording",
    duration: 3,
    price: 6000,
    description: "Full music production and recording session",
    includes: [
      "Full studio access",
      "Multi-track recording",
      "Professional instruments",
      "Sound mixing support",
      "Session musician available",
    ],
  },
]

export const generateTimeSlots = (packageDuration: number): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 9 // 9 AM
  const endHour = 21 // 9 PM

  for (let hour = startHour; hour + packageDuration <= endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`
    const endTime = `${(hour + packageDuration).toString().padStart(2, "0")}:00`
    slots.push({
      id: `slot-${hour}`,
      startTime,
      endTime,
      available: Math.random() > 0.3, // Simulated availability
    })
  }

  return slots
}

export const formatTime = (time: string): string => {
  const [hours] = time.split(":")
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:00 ${ampm}`
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price)
}
