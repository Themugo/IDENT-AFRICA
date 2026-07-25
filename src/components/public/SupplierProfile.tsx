/**
 * Supplier Public Profile Page
 * 
 * Public-facing supplier profile for customers.
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Star,
  Calendar,
  Users,
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  Image,
  Check,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

// Mock supplier data
const MOCK_SUPPLIER = {
  id: '1',
  companyName: 'WildAfrica Tours',
  type: 'safari_operator',
  tagline: 'Your Gateway to African Wildlife',
  description: `WildAfrica Tours has been providing premium safari experiences since 1995. Our expert guides, carefully curated itineraries, and commitment to sustainable tourism have made us one of East Africa's most trusted safari operators.

We specialize in custom-tailored safaris across Kenya, Tanzania, Uganda, and Rwanda, with a focus on responsible wildlife tourism that benefits local communities.

Our team of experienced professional guides brings the African bush to life with their extensive knowledge of wildlife behavior, bird identification, and conservation efforts.`,
  location: 'Nairobi, Kenya',
  contactEmail: 'info@wildafrica.com',
  contactPhone: '+254 20 987 6543',
  website: 'www.wildafrica.com',
  rating: 4.8,
  reviews: 156,
  memberSince: '2023-08-22',
  gallery: [
    { id: '1', url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801', alt: 'Safari Jeep' },
    { id: '2', url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e', alt: 'Elephants' },
    { id: '3', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', alt: 'Lodge' },
    { id: '4', url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53', alt: 'Lion' },
  ],
  products: [
    { id: '1', title: '3 Day Masai Mara Classic Safari', price: 1200, duration: 3, rating: 4.9, bookings: 45, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e' },
    { id: '2', title: '5 Day Kenya Safari Adventure', price: 2400, duration: 5, rating: 4.8, bookings: 32, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801' },
    { id: '3', title: '7 Day Ultimate Safari Experience', price: 3800, duration: 7, rating: 4.9, bookings: 28, image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53' },
    { id: '4', title: 'Gorilla Trek Uganda', price: 3200, duration: 4, rating: 4.7, bookings: 22, image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606' },
  ],
  customerReviews: [
    { id: '1', customerName: 'Sarah M.', rating: 5, title: 'Best Safari Experience!', comment: 'Our guide John was incredible. We saw all the Big Five in the first two days! The accommodation was luxurious and the food was amazing.', date: '2025-07-15', avatar: null },
    { id: '2', customerName: 'Michael C.', rating: 5, title: 'Unforgettable Adventure', comment: 'From the moment we arrived, everything was perfectly organized. The gorilla trekking was a once-in-a-lifetime experience.', date: '2025-07-10', avatar: null },
    { id: '3', customerName: 'Emma W.', rating: 4, title: 'Great Experience', comment: 'Beautiful scenery and excellent wildlife sightings. Would have loved more time at some locations.', date: '2025-07-05', avatar: null },
  ],
};

const TYPE_LABELS: Record<string, string> = {
  lodge: 'Safari Lodge',
  hotel: 'Hotel',
  safari_operator: 'Safari Operator',
  tour_guide: 'Tour Guide',
  transport_company: 'Transport Company',
  activity_provider: 'Activity Provider',
};

// ============ STAR RATING ============

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={size}
        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}
      />
    ))}
  </div>
);

// ============ GALLERY MODAL ============

const GalleryModal: React.FC<{ images: typeof MOCK_SUPPLIER.gallery; startIndex: number; onClose: () => void }> = ({
  images,
  startIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
      >
        ×
      </button>
      
      <button
        onClick={() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)}
        className="absolute left-4 p-2 text-white/70 hover:text-white"
      >
        <ChevronLeft size={32} />
      </button>
      
      <img
        src={images[currentIndex].url}
        alt={images[currentIndex].alt}
        className="max-w-[90vw] max-h-[80vh] object-contain"
      />
      
      <button
        onClick={() => setCurrentIndex(prev => (prev + 1) % images.length)}
        className="absolute right-4 p-2 text-white/70 hover:text-white"
      >
        <ChevronRight size={32} />
      </button>
      
      <div className="absolute bottom-4 text-white/70">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

export const SupplierProfile: React.FC<{ supplierId?: string }> = ({ supplierId }) => {
  const [supplier] = useState(MOCK_SUPPLIER);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'reviews'>('overview');

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-stone-800">
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <a href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white mb-4">
            <ArrowLeft size={18} />
            Back to suppliers
          </a>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Building2 size={40} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-100">{supplier.companyName}</h1>
              <p className="text-stone-400">{TYPE_LABELS[supplier.type]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rating Card */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={supplier.rating} />
                <span className="text-xl font-bold text-stone-100">{supplier.rating}</span>
              </div>
              <p className="text-stone-500 text-sm">{supplier.reviews} reviews</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-stone-300">
                  <MapPin size={18} className="text-stone-500" />
                  {supplier.location}
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <Calendar size={18} className="text-stone-500" />
                  Member since {new Date(supplier.memberSince).getFullYear()}
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <Globe size={18} className="text-stone-500" />
                  <a href={`https://${supplier.website}`} className="text-amber-400 hover:underline">
                    {supplier.website}
                  </a>
                </div>
              </div>

              <button className="w-full mt-6 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-xl flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                Contact Supplier
              </button>
            </div>

            {/* Gallery Preview */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
              <h3 className="font-semibold text-stone-100 mb-4">Gallery</h3>
              <div className="grid grid-cols-2 gap-2">
                {supplier.gallery.slice(0, 4).map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => openGallery(index)}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {index === 3 && supplier.gallery.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-medium">+{supplier.gallery.length - 4}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => openGallery(0)}
                className="w-full mt-3 text-sm text-amber-400 hover:text-amber-300"
              >
                View all photos
              </button>
            </div>
          </div>

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-700">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'packages', label: `Packages (${supplier.products.length})` },
                { id: 'reviews', label: `Reviews (${supplier.reviews})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-stone-100 mb-4">About {supplier.companyName}</h2>
                  <div className="prose prose-invert max-w-none">
                    {supplier.description.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-stone-300 mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-stone-100 mb-4">Why Choose Us</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: '🌍', text: 'Sustainable Tourism' },
                      { icon: '🏆', text: '25+ Years Experience' },
                      { icon: '🎓', text: 'Certified Guides' },
                      { icon: '🚐', text: 'Luxury Vehicles' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-stone-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div className="space-y-4">
                {supplier.products.map(product => (
                  <div key={product.id} className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden hover:border-stone-600 transition-colors">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 md:h-auto">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-stone-100">{product.title}</h3>
                          <div className="flex items-center gap-2">
                            <StarRating rating={product.rating} size={14} />
                            <span className="text-sm text-stone-500">({product.bookings})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-400 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {product.duration} days
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            Max guests varies
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-amber-400">${product.price}</span>
                            <span className="text-stone-500 text-sm">/person</span>
                          </div>
                          <button className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating Summary */}
                <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-stone-100">{supplier.rating}</p>
                      <StarRating rating={supplier.rating} />
                      <p className="text-stone-500 text-sm mt-1">{supplier.reviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => {
                        const count = supplier.reviews * (stars === 5 ? 0.65 : stars === 4 ? 0.25 : 0.1);
                        const percent = (count / supplier.reviews) * 100;
                        return (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm text-stone-400 w-8">{stars} ★</span>
                            <div className="flex-1 h-2 bg-stone-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-sm text-stone-500 w-8">{Math.round(percent)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                {supplier.customerReviews.map(review => (
                  <div key={review.id} className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 font-medium">
                            {review.customerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-stone-100">{review.customerName}</p>
                          <p className="text-sm text-stone-500">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <h4 className="font-medium text-stone-100 mb-2">{review.title}</h4>
                    <p className="text-stone-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <GalleryModal
          images={supplier.gallery}
          startIndex={galleryStartIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
};

export default SupplierProfile;
