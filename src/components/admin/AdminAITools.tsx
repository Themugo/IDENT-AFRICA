/**
 * Admin AI Tools Component
 * 
 * AI-powered tools for administrators.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Mail,
  Search,
  BarChart3,
  Wand2,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Image,
  Globe,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react';

type ContentType = 'destination_description' | 'seo_content' | 'marketing_copy' | 'package_description' | 'social_post';

interface GeneratedContent {
  id: string;
  type: ContentType;
  prompt: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'destination_description', label: 'Destination Description', icon: <MapPin size={16} /> },
  { value: 'seo_content', label: 'SEO Content', icon: <Search size={16} /> },
  { value: 'marketing_copy', label: 'Marketing Copy', icon: <Mail size={16} /> },
  { value: 'package_description', label: 'Package Description', icon: <FileText size={16} /> },
  { value: 'social_post', label: 'Social Media Post', icon: <Image size={16} /> },
];

export const AdminAITools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'analytics' | 'knowledge'>('generate');
  const [contentType, setContentType] = useState<ContentType>('destination_description');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<GeneratedContent[]>([]);

  // Mock analytics data
  const ANALYTICS_DATA = {
    topDestinations: [
      { name: 'Masai Mara', searches: 15420, bookings: 892, conversion: 5.8 },
      { name: 'Serengeti', searches: 12350, bookings: 654, conversion: 5.3 },
      { name: 'Bwindi', searches: 8760, bookings: 423, conversion: 4.8 },
      { name: 'Ngorongoro', searches: 7890, bookings: 356, conversion: 4.5 },
    ],
    topQueries: [
      { query: 'best time to visit masai mara', count: 3240 },
      { query: 'gorilla trekking cost', count: 2890 },
      { query: '5 day kenya safari', count: 2450 },
      { query: 'family safari packages', count: 2120 },
    ],
    recommendations: [
      { metric: 'Recommendations Made', value: '12,450', change: '+15%' },
      { metric: 'Conversion Rate', value: '4.8%', change: '+0.3%' },
      { metric: 'Avg. Session Length', value: '4.2 min', change: '+22%' },
      { metric: 'User Satisfaction', value: '94%', change: '+2%' },
    ],
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const templates: Record<ContentType, string> = {
      destination_description: `${context || 'Masai Mara'} is one of Africa's most iconic safari destinations, offering an unparalleled wildlife experience that draws visitors from around the globe.\n\n**Why Visit?**\nThe reserve is renowned for its exceptional populations of lions, leopards, elephant, buffalo, and rhinos—the famous Big Five. But it's the Great Migration that truly sets it apart, when millions of wildebeest cross the Mara River in one of nature's most dramatic spectacles.\n\n**Best Time to Visit**\nThe dry season (June-October) offers the best wildlife viewing, with animals gathering around water sources. The Great Migration typically peaks in July and August.\n\n**What to Expect**\nExpect early morning game drives, breathtaking sunsets over the savanna, and encounters with Maasai culture. Accommodations range from luxury tented camps to budget-friendly options.`,
      seo_content: `**Meta Title:** ${context || 'Masai Mara'} Safari 2025 | Best Tours & Packages | IDENT AFRICA\n\n**Meta Description:** Book your ${context || 'Masai Mara'} safari with IDENT AFRICA. Expert guides, luxury camps, and unforgettable wildlife encounters. Prices from $1,200. Free cancellation. Book today!\n\n**Keywords:** ${context || 'Masai Mara'} safari, Kenya safari, Great Migration, African safari tours, Masai Mara packages\n\n**H1:** Experience the Magic of ${context || 'Masai Mara'} on Safari\n\n**H2:** Why Choose ${context || 'Masai Mara'}?\n\n**Content:** Discover why ${context || 'Masai Mara'} should be your next safari destination...`,
      marketing_copy: `✈️ **Your African Dream Safari Awaits**\n\nImagine waking up to the sounds of the African bush, watching a lioness patrol the golden grasslands, and witnessing the Great Migration unfold before your eyes.\n\nThis is ${context || 'Masai Mara'} — where nature's greatest show unfolds every day.\n\n**What Makes This Special:**\n✅ World-class wildlife viewing\n✅ Expert safari guides\n✅ Authentic cultural experiences\n✅ Comfortable accommodations\n✅ Seamless booking experience\n\n🎁 **Limited Time Offer:**\nBook now and receive complimentary airport transfers + free upgrade subject to availability.\n\n*Starting from $1,200 per person*\n\n🔗 [View Packages] | 📞 Contact Us | 📱 Chat with AI Assistant`,
      package_description: `**${context || '3-Day Masai Mara Classic Safari'}**\n\nImmerse yourself in the heart of Africa's wildlife paradise with this carefully curated safari experience.\n\n**Highlights:**\n🦁 Game drives in search of the Big Five\n🌅 Breathtaking savanna sunsets\n🏕️ Luxury tented camp accommodation\n📸 Photography opportunities\n\n**Itinerary:**\nDay 1: Nairobi → Masai Mara, afternoon game drive\nDay 2: Full day game drives, optional balloon safari\nDay 3: Morning game drive, return to Nairobi\n\n**Includes:**\n• Transport in 4x4 safari vehicle\n• Park fees\n• All meals\n• Accommodation\n• Professional guide\n\n**From:** $1,200 per person\n\nBook Now | Customizable | Expert Support`,
      social_post: `🌍 *Where dreams become adventures*\n\nThere's something magical about watching the sun rise over the African savanna, a cup of coffee in hand, as elephants pass by in the golden light.\n\nThis is why we do what we do.\n\n📍 ${context || 'Masai Mara, Kenya'}\n📸 Tag us @identafrica for a chance to be featured!\n\n#AfricanSafari #WildlifePhotography #MasaiMara #TravelAfrica #SafariLife #IDENTAfrica`,
    };

    const newContent: GeneratedContent = {
      id: `content_${Date.now()}`,
      type: contentType,
      prompt,
      content: templates[contentType],
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    setGeneratedContent(newContent);
    setHistory(prev => [newContent, ...prev]);
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-purple-400" />
              <h1 className="text-xl font-bold text-stone-100">AI Tools</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
              <RefreshCw size={18} />
              Sync Data
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'generate', label: 'Content Generator', icon: Wand2 },
            { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
            { id: 'knowledge', label: 'Knowledge Base', icon: Globe },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Content Generator Tab */}
        {activeTab === 'generate' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Generator Panel */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-stone-100 mb-4">Generate Content</h2>
              
              <div className="space-y-4">
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setContentType(type.value)}
                        className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                          contentType === type.value
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                            : 'border-stone-700 hover:border-stone-600 text-stone-400'
                        }`}
                      >
                        {type.icon}
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Context */}
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Subject/Context</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., Masai Mara, Safari Package"
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
                  />
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Additional Instructions</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g., Focus on family-friendly aspects, emphasize photography opportunities..."
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 resize-none"
                  />
                </div>

                <button
                  onClick={generateContent}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-stone-700 disabled:to-stone-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-100">Generated Content</h2>
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg flex items-center gap-1 text-sm"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg flex items-center gap-1 text-sm">
                      <Edit3 size={14} />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {generatedContent ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-stone-300 font-sans bg-stone-900 p-4 rounded-lg border border-stone-700 overflow-auto max-h-[400px]">
                    {generatedContent.content}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-stone-500">
                  <Sparkles size={48} className="mb-4 opacity-50" />
                  <p>Generated content will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {ANALYTICS_DATA.recommendations.map((stat, index) => (
                <div key={index} className="bg-stone-800/50 border border-stone-700 rounded-xl p-5">
                  <p className="text-sm text-stone-400 mb-1">{stat.metric}</p>
                  <p className="text-2xl font-bold text-stone-100">{stat.value}</p>
                  <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Destinations */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <h3 className="font-semibold text-stone-100 mb-4">Top Searched Destinations</h3>
                <div className="space-y-3">
                  {ANALYTICS_DATA.topDestinations.map((dest, index) => (
                    <div key={dest.name} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-stone-100">{dest.name}</p>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                          <span>{dest.searches.toLocaleString()} searches</span>
                          <span>{dest.bookings} bookings</span>
                          <span className="text-emerald-400">{dest.conversion}% conversion</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Queries */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <h3 className="font-semibold text-stone-100 mb-4">Common AI Queries</h3>
                <div className="space-y-3">
                  {ANALYTICS_DATA.topQueries.map((item, index) => (
                    <div key={item.query} className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Search size={16} className="text-stone-500" />
                        <span className="text-stone-300">{item.query}</span>
                      </div>
                      <span className="text-stone-500">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
            <h3 className="font-semibold text-stone-100 mb-4">AI Knowledge Base</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { type: 'Facts', count: 156, icon: MapPin },
                { type: 'Travel Tips', count: 89, icon: TrendingUp },
                { type: 'FAQs', count: 45, icon: Users },
              ].map(item => (
                <div key={item.type} className="p-4 bg-stone-900/50 rounded-xl border border-stone-700">
                  <item.icon size={24} className="text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-stone-100">{item.count}</p>
                  <p className="text-sm text-stone-400">{item.type}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-stone-500 mt-4">
              The AI uses this knowledge base to provide accurate information about destinations, travel tips, and frequently asked questions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAITools;
