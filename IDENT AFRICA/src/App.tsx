/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Hero } from './components/home/Hero';
import { FeaturedDestinations } from './components/home/FeaturedDestinations';
import { ItineraryShowcase } from './components/home/ItineraryShowcase';
import { InteractiveMap } from './components/home/InteractiveMap';
import { TrustPillars } from './components/home/TrustPillars';
import { Testimonials } from './components/home/Testimonials';
import { DestinationListing } from './components/destinations/DestinationListing';
import { DestinationDetail } from './components/destinations/DestinationDetail';
import { HotelListing } from './components/hotels/HotelListing';
import { HotelDetail } from './components/hotels/HotelDetail';
import { HotelComparator } from './components/hotels/HotelComparator';
import { TripComparator } from './components/compare/TripComparator';
import { AISafariPlanner } from './components/ai-planner/AISafariPlanner';
import { VisualItineraryBuilder } from './components/builder/VisualItineraryBuilder';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';

const MainContent: React.FC = () => {
  const { currentPage } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            <Hero />
            <FeaturedDestinations />
            <ItineraryShowcase />
            <InteractiveMap />
            <TrustPillars />
            <Testimonials />
          </>
        )}

        {currentPage === 'destinations' && <DestinationListing />}
        {currentPage === 'destination-detail' && <DestinationDetail />}
        {currentPage === 'hotels' && <HotelListing />}
        {currentPage === 'hotel-detail' && <HotelDetail />}
        {currentPage === 'compare-hotels' && <HotelComparator />}
        {currentPage === 'itineraries' && <ItineraryShowcase />}
        {currentPage === 'itinerary-builder' && <VisualItineraryBuilder />}
        {currentPage === 'compare' && <TripComparator />}
        {currentPage === 'ai-planner' && <AISafariPlanner />}
        {currentPage === 'user-dashboard' && <UserDashboard />}
        {currentPage === 'admin-dashboard' && <AdminDashboard />}
      </main>

      <Footer />

      {/* Global Modals */}
      <AuthModal />
      <BookingModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
