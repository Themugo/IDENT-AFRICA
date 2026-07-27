/**
 * Blog CMS Component
 * 
 * Content marketing management for IDENT AFRICA.
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt: string;
  viewCount: number;
}

const MOCK_POSTS: BlogPost[] = [
  { id: '1', title: 'The Great Migration: Everything You Need to Know', slug: 'great-migration-guide', excerpt: 'Discover the world\'s most spectacular wildlife event', category: 'Safari Guide', tags: ['masai mara', 'migration', 'wildlife'], featuredImage: '', author: 'Sarah Johnson', status: 'published', publishedAt: '2025-07-15', viewCount: 3420 },
  { id: '2', title: 'Top 10 Luxury Safari Lodges in Kenya', slug: 'luxury-safari-lodges-kenya', excerpt: 'Experience the wild in style with these premium accommodations', category: 'Accommodation', tags: ['luxury', 'kenya', 'lodges'], featuredImage: '', author: 'Mike Chen', status: 'published', publishedAt: '2025-07-18', viewCount: 2890 },
  { id: '3', title: 'Photography Tips for Your Safari', slug: 'safari-photography-tips', excerpt: 'Capture stunning wildlife moments', category: 'Tips & Advice', tags: ['photography', 'tips'], featuredImage: '', author: 'Emma Wilson', status: 'published', publishedAt: '2025-07-20', viewCount: 1560 },
  { id: '4', title: 'Rwanda Gorilla Trekking Guide', slug: 'rwanda-gorilla-trekking', excerpt: 'An unforgettable encounter with mountain gorillas', category: 'Adventure', tags: ['rwanda', 'gorilla', 'trekking'], featuredImage: '', author: 'Sarah Johnson', status: 'review', publishedAt: '', viewCount: 0 },
  { id: '5', title: 'Kenya vs Tanzania Safari', slug: 'kenya-vs-tanzania-safari', excerpt: 'Which destination is right for you?', category: 'Safari Guide', tags: ['kenya', 'tanzania', 'comparison'], featuredImage: '', author: 'Mike Chen', status: 'draft', publishedAt: '', viewCount: 0 },
];

const CATEGORIES = ['Safari Guide', 'Accommodation', 'Tips & Advice', 'Adventure', 'Culture', 'News'];

export const BlogCMS: React.FC = () => {
  const [posts] = useState(MOCK_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-500/20 text-emerald-400';
      case 'review': return 'bg-amber-500/20 text-amber-400';
      case 'draft': return 'bg-stone-500/20 text-stone-400';
      default: return 'bg-stone-500/20 text-stone-400';
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText size={24} className="text-emerald-400" />
              <h1 className="text-xl font-bold text-stone-100">Content Manager</h1>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2">
            <Plus size={18} />
            New Post
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <p className="text-sm text-stone-400 mb-1">Total Posts</p>
            <p className="text-2xl font-bold text-stone-100">{posts.length}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <p className="text-sm text-stone-400 mb-1">Published</p>
            <p className="text-2xl font-bold text-emerald-400">{posts.filter(p => p.status === 'published').length}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <p className="text-sm text-stone-400 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-blue-400">{posts.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
            <p className="text-sm text-stone-400 mb-1">Categories</p>
            <p className="text-2xl font-bold text-purple-400">{CATEGORIES.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="review">In Review</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Posts Table */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-900/50">
              <tr>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Post</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Author</th>
                <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Views</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700/50">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-stone-700 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-stone-100">{post.title}</p>
                        <p className="text-xs text-stone-500">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-stone-700 rounded-full text-xs text-stone-300">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-stone-300">{post.author}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-stone-300">{post.viewCount > 0 ? post.viewCount.toLocaleString() : '-'}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-stone-600" />
              <h3 className="text-lg font-medium text-stone-300 mb-2">No posts found</h3>
              <p className="text-stone-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogCMS;
