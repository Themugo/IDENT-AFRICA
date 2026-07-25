import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LuxuryLodge } from '../../types';
import { X, Calendar, CheckCircle, MapPin, Sparkles } from 'lucide-react';

interface Props {
  hotel: LuxuryLodge;
  isOpen: boolean;
  onClose: () => void;
}

export const AddHotelToItineraryModal: React.FC<Props> = ({ hotel, isOpen, onClose }) => {
  const { itineraries, addHotelToItinerary, navigateTo } = useApp();
  
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>(itineraries[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItinerary = itineraries.find(i => i.id === selectedItineraryId);

  const handleAdd = () => {
    if (!selectedItineraryId || !selectedDay) return;
    
    addHotelToItinerary(hotel.id, selectedItineraryId, selectedDay);
    setSuccessMessage(`Successfully set ${hotel.name} as accommodation for Day ${selectedDay} in "${currentItinerary?.title}".`);
    
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#181E1A] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-6 text-[#F5EBE0] shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] px-3 py-1 bg-[#12241A] rounded-full border border-[#D4AF37]/30 inline-block">
            Expedition Customization
          </span>
          <h3 className="text-2xl font-serif font-bold text-[#F5EBE0]">
            Add Lodge to Safari Itinerary
          </h3>
          <p className="text-xs font-mono text-[#F5EBE0]/70">
            Assign <strong className="text-[#D4AF37]">{hotel.name}</strong> as your accommodation choice on a specific expedition day.
          </p>
        </div>

        {successMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold">{successMessage}</p>
              <button
                onClick={() => navigateTo('itinerary-detail', selectedItineraryId)}
                className="mt-2 text-[10px] text-white underline font-bold"
              >
                View Updated Itinerary Day
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs">
            
            {/* Selected Hotel Summary Card */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#12241A] border border-[#2A362E]">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-sm text-[#F5EBE0]">{hotel.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-[#D4AF37]">
                  <MapPin className="w-3 h-3" />
                  <span>{hotel.location}</span>
                </div>
                <span className="text-[10px] text-[#F5EBE0]/60 block">{hotel.category} • Eco Score {hotel.ecoScore}/10</span>
              </div>
            </div>

            {/* Select Itinerary */}
            <div>
              <label className="block uppercase text-[#D4AF37] mb-2 font-bold">Select Target Expedition Itinerary</label>
              <select
                value={selectedItineraryId}
                onChange={e => {
                  setSelectedItineraryId(e.target.value);
                  setSelectedDay(1);
                }}
                className="w-full px-4 py-3 rounded-xl bg-[#12241A] border border-[#2A362E] focus:outline-none focus:border-[#D4AF37] text-white"
              >
                {itineraries.map(itin => (
                  <option key={itin.id} value={itin.id}>
                    {itin.title} ({itin.durationDays} Days / {itin.durationNights} Nights)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Day */}
            {currentItinerary && (
              <div>
                <label className="block uppercase text-[#D4AF37] mb-2 font-bold">Select Expedition Day</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {currentItinerary.dayByDay.map(dayItem => (
                    <button
                      type="button"
                      key={dayItem.day}
                      onClick={() => setSelectedDay(dayItem.day)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedDay === dayItem.day
                          ? 'bg-[#1E3A2B] border-[#D4AF37] text-[#D4AF37] shadow-md font-bold'
                          : 'bg-[#12241A] border-[#2A362E] text-[#F5EBE0]/80 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span>Day {dayItem.day}</span>
                        <Calendar className="w-3 h-3 opacity-60" />
                      </div>
                      <p className="text-[10px] truncate">{dayItem.location}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A362E]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#2A362E] hover:bg-white/5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="btn-gold px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" /> Confirm Accommodation Day
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
