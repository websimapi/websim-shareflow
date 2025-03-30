// This file describes the data models used in the application

// Resource Item
/*
{
  type: 'resource_item',
  id: string, // auto-generated
  username: string, // auto-filled
  created_at: string, // auto-filled
  title: string,
  description: string,
  category: string, // one of CONFIG.CATEGORIES
  image_url: string, // optional
  status: string, // 'available', 'pending', 'claimed'
  location: { lat: number, lng: number } // optional, for future location-based features
}
*/

// Service Offer
/*
{
  type: 'service_offer',
  id: string, // auto-generated
  username: string, // auto-filled
  created_at: string, // auto-filled
  title: string,
  description: string,
  category: string, // one of CONFIG.SERVICE_CATEGORIES
  hoursOffered: number,
  availableTimes: string[], // from CONFIG.DEFAULT_TIME_SLOTS
  status: string, // 'available', 'pending', 'booked'
  location: { lat: number, lng: number } // optional, for future location-based features
}
*/

// Item Request
/*
{
  type: 'item_request',
  id: string, // auto-generated
  username: string, // auto-filled (requester)
  created_at: string, // auto-filled
  item_id: string, // reference to resource_item
  message: string, // optional message from requester
  status: string, // 'pending', 'approved', 'rejected'
}
*/

// Service Booking
/*
{
  type: 'service_booking',
  id: string, // auto-generated
  username: string, // auto-filled (booker)
  created_at: string, // auto-filled
  service_id: string, // reference to service_offer
  requested_hours: number,
  requested_time: string, // one of the available times
  message: string, // optional message from booker
  status: string, // 'pending', 'approved', 'rejected', 'completed'
}
*/

// Transaction (for point system)
/*
{
  type: 'transaction',
  id: string, // auto-generated
  created_at: string, // auto-filled
  sender_username: string,
  receiver_username: string,
  points: number,
  item_id: string, // optional reference to resource_item
  service_id: string, // optional reference to service_offer
  type: string, // 'item_claim', 'service_booking', 'donation', etc.
}
*/

// User Profile (future enhancement)
/*
{
  type: 'user_profile',
  id: string, // auto-generated
  username: string, // auto-filled
  created_at: string, // auto-filled
  bio: string,
  interests: string[],
  location: { lat: number, lng: number },
  preferences: {
    notifications: boolean,
    radius: number, // search radius in miles
    categories: string[] // preferred categories
  }
}
*/

// Review (future enhancement)
/*
{
  type: 'review',
  id: string, // auto-generated
  username: string, // auto-filled (reviewer)
  created_at: string, // auto-filled
  target_username: string, // user being reviewed
  item_id: string, // optional reference to resource_item
  service_id: string, // optional reference to service_offer
  rating: number, // 1-5 stars
  comment: string
}
*/

