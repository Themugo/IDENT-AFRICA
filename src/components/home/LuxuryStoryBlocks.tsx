import React, { useState, useEffect, useRef } from 'react';
import { Camera, BookOpen, Mountain, Sun, ChevronRight, Play, Clock, Eye } from 'lucide-react';

interface StoryBlock {
  id: string;
  type: 'feature' | 'narrative' | 'photography' | 'insight';
  title: string;
  subtitle: string;
  description: string;
  image: string;
  readTime?: string;
  author?: string;
  category?: string;
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'cinematic';
}

export const LuxuryStoryBlocks: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const storyBlocks: StoryBlock[] = [
    {
      id: 'dawn-safari',
      type: 'feature',
      title: 'The Golden Hour',
      subtitle: 'Photography Masterclass with Master Rangers',
      description: 'As the African sun crests the horizon, transforming the savannah into a canvas of gold and amber, master photographers reveal their secrets for capturing the perfect light.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85',
      readTime: '12 min read',
      author: 'James Whitfield, Safari Photographer',
      category: 'Photography',
      aspectRatio: 'cinematic'
    },
    {
      id: 'silent-giants',
      type: 'narrative',
      title: 'Silent Giants',
      subtitle: 'Understanding Elephant Society',
      description: 'In the ancient Acacia woodlands, elephant matriarchs lead their families across generational song lines. Our naturalist reveals the complex social architecture of these remarkable creatures.',
      image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=85',
      readTime: '8 min read',
      author: 'Dr. Sarah Mitchell, Wildlife Biologist',
      category: 'Wildlife',
      aspectRatio: 'portrait'
    },
    {
      id: 'maasai-culture',
      type: 'insight',
      title: 'Keepers of Tradition',
      subtitle: 'The Maasai Way of Life',
      description: 'For over 500 years, the Maasai have maintained their warrior traditions while adapting to the modern world. A rare glimpse into one of Africa\'s most iconic cultures.',
      image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=85',
      readTime: '15 min read',
      author: 'David Kimani, Cultural Anthropologist',
      category: 'Culture',
      aspectRatio: 'landscape'
    },
    {
      id: 'migration-science',
      type: 'narrative',
      title: 'The Great Circle',
      subtitle: 'Science Behind the Migration',
      description: 'Two million years of evolution have hardwired the wildebeest\'s journey. Leading researchers explain the triggers, routes, and mysteries of nature\'s greatest spectacle.',
      image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=85',
      readTime: '10 min read',
      author: 'Prof. Robert Chen, Ecologist',
      category: 'Science',
      aspectRatio: 'square'
    },
    {
      id: 'mountain-gorillas',
      type: 'photography',
      title: 'Eyes That Speak',
      subtitle: 'Intimate Gorilla Encounters',
      description: 'In the misty forests of Rwanda, a silverback regards you with ancient eyes. Photographer Elena Rodriguez shares her journey capturing the mountain gorilla experience.',
      image: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=800&q=85',
      readTime: '6 min read',
      author: 'Elena Rodriguez, Photojournalist',
      category: 'Photography',
      aspectRatio: 'portrait'
    },
    {
      id: 'bush-dining',
      type: 'feature',
      title: 'Dinner Under Stars',
      subtitle: 'The Art of Bush Cuisine',
      description: 'From sundowners on termite mounds to moonlit feasts in the wild, discover how East Africa\'s finest chefs transform the bush into a culinary theater.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
      readTime: '9 min read',
      author: 'Chef Amara Osei, Culinary Director',
      category: 'Culinary',
      aspectRatio: 'cinematic'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTypeIcon = (type: StoryBlock['type']) => {
    switch (type) {
      case 'feature': return <Camera className="w-4 h-4" />;
      case 'narrative': return <BookOpen className="w-4 h-4" />;
      case 'photography': return <Eye className="w-4 h-4" />;
      case 'insight': return <Mountain className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: StoryBlock['type']) => {
    switch (type) {
      case 'feature': return 'bg-[#C89A4B] text-[#1a1008]';
      case 'narrative': return 'bg-[#4F6848] text-[#F4E8D5]';
      case 'photography': return 'bg-[#2D2621] text-[#F4E8D5]';
      case 'insight': return 'bg-[#FFF8EC] text-[#2A1E17] border border-[#C89A4B]/40';
    }
  };

  const getAspectClass = (aspect: StoryBlock['aspectRatio']) => {
    switch (aspect) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'square': return 'aspect-square';
      case 'cinematic': return 'aspect-[21/9]';
    }
  };

  // Feature stories for top section
  const featureStory = storyBlocks[0];
  const secondFeature = storyBlocks[5];

  // Grid stories
  const gridStories = storyBlocks.slice(1, 5);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-[#1a1510]">
      
      {/* Editorial Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#2D2621]/50 to-[#1a1510]" />
        {/* Subtle texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C89A4B]" />
            <BookOpen className="w-5 h-5 text-[#C89A4B]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C89A4B]" />
          </div>
          
          <h2 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6 text-[#F4E8D5]">
            Stories from the <span className="italic text-[#C89A4B]">Wild</span>
          </h2>
          
          <p className="text-base text-[#D3C5AE] max-w-2xl mx-auto font-light leading-relaxed">
            Editorial perspectives from naturalists, photographers, and cultural experts. 
            Immerse yourself in the stories that define East Africa.
          </p>
        </div>

        {/* Featured Stories - Magazine Layout */}
        <div className={`mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          
          {/* Main Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div 
              className="group relative overflow-hidden rounded-3xl cursor-pointer"
              onMouseEnter={() => setHoveredStory(featureStory.id)}
              onMouseLeave={() => setHoveredStory(null)}
            >
              <div className={getAspectClass(featureStory.aspectRatio)}>
                <img 
                  src={featureStory.image}
                  alt={featureStory.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-[#1a1510]/40 to-transparent" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="space-y-4 transform transition-transform duration-500" style={{ transform: hoveredStory === featureStory.id ? 'translateY(-8px)' : 'translateY(0)' }}>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] font-cinzel tracking-[0.2em] uppercase rounded-full ${getTypeColor(featureStory.type)}`}>
                    {getTypeIcon(featureStory.type)}
                    {featureStory.category}
                  </span>
                  <h3 className="font-cormorant text-4xl sm:text-5xl font-light text-[#F4E8D5]">
                    {featureStory.title}
                  </h3>
                  <p className="text-[#C89A4B] italic font-light">
                    {featureStory.subtitle}
                  </p>
                  <p className="text-sm text-[#D3C5AE] leading-relaxed line-clamp-2">
                    {featureStory.description}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-[#D3C5AE]">
                    <span className="font-cinzel tracking-wider">{featureStory.author}</span>
                    <span className="text-[#C89A4B]">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featureStory.readTime}
                    </span>
                  </div>
                </div>
                
                <button className="mt-6 flex items-center gap-2 text-[#C89A4B] group-hover:gap-4 transition-all">
                  <span className="text-[10px] font-cinzel tracking-[0.2em] uppercase">Read Story</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Secondary Feature */}
            <div 
              className="group relative overflow-hidden rounded-3xl cursor-pointer lg:row-span-2"
              onMouseEnter={() => setHoveredStory(secondFeature.id)}
              onMouseLeave={() => setHoveredStory(null)}
            >
              <div className="h-full">
                <img 
                  src={secondFeature.image}
                  alt={secondFeature.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-[#1a1510]/30 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] font-cinzel tracking-[0.2em] uppercase rounded-full w-fit mb-4 ${getTypeColor(secondFeature.type)}`}>
                  {getTypeIcon(secondFeature.type)}
                  {secondFeature.category}
                </span>
                <h3 className="font-cormorant text-4xl sm:text-5xl font-light text-[#F4E8D5] mb-2">
                  {secondFeature.title}
                </h3>
                <p className="text-[#C89A4B] italic font-light text-lg">
                  {secondFeature.subtitle}
                </p>
                <p className="text-sm text-[#D3C5AE] leading-relaxed mt-4 max-w-md">
                  {secondFeature.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[#D3C5AE] mt-4">
                  <span className="font-cinzel tracking-wider">{secondFeature.author}</span>
                  <span className="text-[#C89A4B]">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {secondFeature.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Stories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridStories.map((story, idx) => (
              <div 
                key={story.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                onMouseEnter={() => setHoveredStory(story.id)}
                onMouseLeave={() => setHoveredStory(null)}
              >
                <div className={getAspectClass(story.aspectRatio === 'square' ? 'square' : story.aspectRatio === 'portrait' ? 'portrait' : 'landscape')}>
                  <img 
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-[#1a1510]/50 to-transparent" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className={`inline-flex items-center gap-2 px-2.5 py-1 text-[8px] font-cinzel tracking-[0.2em] uppercase rounded-full w-fit mb-3 ${getTypeColor(story.type)}`}>
                    {getTypeIcon(story.type)}
                    {story.category}
                  </span>
                  <h4 className="font-cormorant text-2xl font-light text-[#F4E8D5] group-hover:text-[#C89A4B] transition-colors">
                    {story.title}
                  </h4>
                  <p className="text-[11px] text-[#C89A4B] italic mt-1">
                    {story.subtitle}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#D3C5AE] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-cinzel tracking-wider truncate max-w-[120px]">{story.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {story.readTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Quote */}
        <div className={`py-16 border-t border-b border-[#C89A4B]/20 my-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <blockquote className="text-center max-w-4xl mx-auto">
            <p className="font-cormorant text-2xl sm:text-3xl md:text-4xl text-[#F4E8D5] font-light italic leading-relaxed">
              "The African bush has a quality of light and silence that touches something primitive in the human spirit. 
              To witness the great migration is to understand our place in the natural world."
            </p>
            <footer className="mt-8 flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-[#C89A4B]" />
              <cite className="text-[#C89A4B] not-italic font-cinzel tracking-[0.2em] text-[11px] uppercase">
                Anton Thompson, Chief Naturalist
              </cite>
              <div className="w-12 h-px bg-[#C89A4B]" />
            </footer>
          </blockquote>
        </div>

        {/* Video Story Teaser */}
        <div className={`text-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#C89A4B]/20 border border-[#C89A4B]/40 mb-6 group cursor-pointer hover:bg-[#C89A4B]/40 transition-colors">
            <Play className="w-8 h-8 text-[#C89A4B] ml-1 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="font-cormorant text-2xl text-[#F4E8D5] mb-2">
            Watch: A Day in the Life of a Safari Guide
          </h4>
          <p className="text-sm text-[#D3C5AE]">
            18-minute documentary film
          </p>
        </div>

        {/* Newsletter/Stay Connected */}
        <div className={`mt-20 bg-[#2D2621]/60 backdrop-blur-xl rounded-3xl p-12 border border-[#C89A4B]/20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Sun className="w-8 h-8 text-[#C89A4B] mb-4" />
              <h3 className="font-cormorant text-3xl text-[#F4E8D5] font-light mb-4">
                The Field Journal
              </h3>
              <p className="text-[#D3C5AE] leading-relaxed">
                Receive monthly dispatches from our naturalists — wildlife sightings, conservation updates, 
                insider travel tips, and exclusive expedition invitations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-[#1a1510] border border-[#C89A4B]/30 rounded-full text-[#F4E8D5] placeholder-[#D3C5AE]/50 focus:outline-none focus:border-[#C89A4B] transition-colors"
              />
              <button className="px-8 py-4 bg-[#C89A4B] text-[#1a1008] font-cinzel text-[11px] tracking-[0.2em] uppercase font-bold rounded-full hover:bg-[#D6B06A] transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
