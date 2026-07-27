/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
// Navigation Components
import { BreadcrumbBar } from './components/navigation/BreadcrumbBar';
import { StickyInquiryButton } from './components/navigation/StickyInquiryButton';
import { QuickNavDrawer } from './components/navigation/QuickNavDrawer';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
// CRO-Optimized Homepage
import { ConversionHome } from './components/home/ConversionHome';
// Luxury Brand Components (for detailed exploration pages)
import { LuxuryStoryBlocks } from './components/home/LuxuryStoryBlocks';
import { EastAfricaMap } from './components/home/EastAfricaMap';
import { MigrationRoutes } from './components/home/MigrationRoutes';
import { ConservationImpact } from './components/home/ConservationImpact';
import { AuthoritySection } from './components/home/AuthoritySection';
// Original Components (functionality)
import { FeaturedDestinations } from './components/home/FeaturedDestinations';
import { ExperiencePillars } from './components/home/ExperiencePillars';
import { ItineraryShowcase } from './components/home/ItineraryShowcase';
import { InteractiveMap } from './components/home/InteractiveMap';
import { SeasonalCalendar } from './components/home/SeasonalCalendar';
import { TrustPillars } from './components/home/TrustPillars';
import { Testimonials } from './components/home/Testimonials';
import { DestinationListing } from './components/destinations/DestinationListing';
import { DestinationDetail } from './components/destinations/DestinationDetail';
import { HotelListing } from './components/hotels/HotelListing';
import { HotelDetail } from './components/hotels/HotelDetail';
import { HotelComparator } from './components/hotels/HotelComparator';
import { TripComparator } from './components/compare/TripComparator';
// AI Concierge Components
import { LuxurySafariConcierge } from './components/ai-planner/LuxurySafariConcierge';
import { AISafariPlanner } from './components/ai-planner/AISafariPlanner';
import { VisualItineraryBuilder } from './components/builder/VisualItineraryBuilder';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { SupplierPortal } from './components/supplier/SupplierPortal';
import { BookingHistoryView } from './components/booking/BookingHistoryView';
import { SearchPage } from './components/search/SearchPage';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const MainContent: React.FC = () => {
  const { currentPage, navigateTo, user } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Enterprise Navigation: Breadcrumbs on all pages except home */}
      <BreadcrumbBar />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            {/* CRO-Optimized Homepage - Conversion Focused */}
            <ConversionHome />
          </>
        )}

        {currentPage === 'search' && (
          <SearchPage
            userId={user?.id}
            onResultClick={(result) => {
              if (result.type === 'destination') {
                navigateTo('destination-detail', result.id);
              } else if (result.type === 'package') {
                navigateTo('itineraries', result.id);
              } else if (result.type === 'supplier') {
                navigateTo('hotels', result.id);
              } else {
                navigateTo('hotels', result.id);
              }
            }}
          />
        )}
        {currentPage === 'destinations' && <DestinationListing />}
        {currentPage === 'destination-detail' && <DestinationDetail />}
        {currentPage === 'hotels' && <HotelListing />}
        {currentPage === 'hotel-detail' && <HotelDetail />}
        {currentPage === 'compare-hotels' && <HotelComparator />}
        {currentPage === 'itineraries' && <ItineraryShowcase />}
        {currentPage === 'itinerary-builder' && <VisualItineraryBuilder />}
        {currentPage === 'compare' && <TripComparator />}
        {currentPage === 'ai-planner' && <LuxurySafariConcierge />}
        {currentPage === 'user-dashboard' && (
          <ProtectedRoute title="Traveler Portal & Concierge" description="Sign in to view your luxury itinerary reservations, concierge messages, and rewards status.">
            <UserDashboard />
          </ProtectedRoute>
        )}
        {currentPage === 'admin-dashboard' && (
          <ProtectedRoute allowedRoles={['admin']} title="Platform Management Console" description="Administrator credentials required to manage destinations, lodges, suppliers, and financial audits.">
            <AdminDashboard />
          </ProtectedRoute>
        )}
        {currentPage === 'supplier-portal' && (
          <ProtectedRoute allowedRoles={['supplier', 'ranger_partner', 'admin']} title="Supplier & Ranger Partner Hub" description="Supplier or Ranger Partner authentication required to manage rates, allocations, and service requests.">
            <SupplierPortal />
          </ProtectedRoute>
        )}
        {currentPage === 'my-bookings' && (
          <ProtectedRoute title="Safari Expeditions & Bookings" description="Sign in to access your active safari vouchers, payment receipts, and travel documents.">
            <BookingHistoryView />
          </ProtectedRoute>
        )}
      </main>

      <Footer />

      {/* Mobile-First Bottom Navigation with WhatsApp Concierge */}
      <MobileBottomNav />

      {/* Enterprise Navigation Elements */}
      <StickyInquiryButton />
      <QuickNavDrawer />

      {/* Global Modals */}
      <AuthModal />
      <BookingModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
