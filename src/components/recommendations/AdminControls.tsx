'use client';

/**
 * Recommendation Admin Controls
 * 
 * Admin interface for adjusting recommendation settings.
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, BarChart3, TrendingUp, Users, Star, Calendar, Sparkles } from 'lucide-react';
import { recommendationAdmin, learningSystem, recommendationEngine } from '../../services/recommendations';
import type { AdminSettings, RecommendationWeights } from '../../services/recommendations';

export default function AdminControls() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [metrics, setMetrics] = useState<ReturnType<typeof learningSystem.getOverallMetrics> | null>(null);
  const [activeTab, setActiveTab] = useState<'weights' | 'settings' | 'metrics'>('weights');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const adminSettings = recommendationAdmin.getSettings();
    setSettings(adminSettings);
    
    const overallMetrics = learningSystem.getOverallMetrics();
    setMetrics(overallMetrics);
  };

  const handleWeightChange = (key: keyof RecommendationWeights, value: number) => {
    if (!settings) return;
    
    const currentWeights = settings.weights;
    const newWeights = { ...currentWeights, [key]: value };
    
    // Normalize weights
    const keys = Object.keys(newWeights) as Array<keyof RecommendationWeights>;
    let total = 0;
    for (const k of keys) {
      total += newWeights[k];
    }
    if (total > 0 && total !== 1) {
      for (const k of keys) {
        newWeights[k] = newWeights[k] / total;
      }
    }
    
    setSettings({
      ...settings,
      weights: newWeights,
    });
    
    recommendationEngine.setWeights(newWeights);
  };

  const handlePresetApply = (presetName: string) => {
    recommendationAdmin.applyPreset(presetName, 'admin');
    loadData();
  };

  const handleSave = () => {
    if (!settings) return;
    
    recommendationAdmin.updateSettings(settings, 'admin');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    recommendationAdmin.resetToDefaults('admin');
    loadData();
  };

  const toggleFeature = (feature: keyof AdminSettings) => {
    if (!settings || typeof settings[feature] !== 'boolean') return;
    
    recommendationAdmin.toggleFeature(feature as any, 'admin');
    loadData();
  };

  if (!settings) {
    return <div className="animate-pulse p-8">Loading...</div>;
  }

  const weightLabels: Record<keyof RecommendationWeights, { label: string; icon: React.ReactNode }> = {
    customerPreference: { label: 'Customer Preference', icon: <Users className="w-4 h-4" /> },
    seasonality: { label: 'Seasonality', icon: <Calendar className="w-4 h-4" /> },
    budget: { label: 'Budget Match', icon: <BarChart3 className="w-4 h-4" /> },
    popularity: { label: 'Popularity', icon: <TrendingUp className="w-4 h-4" /> },
    ratings: { label: 'Ratings', icon: <Star className="w-4 h-4" /> },
    availability: { label: 'Availability', icon: <Sparkles className="w-4 h-4" /> },
    recency: { label: 'Recency', icon: <Calendar className="w-4 h-4" /> },
    collaborative: { label: 'Collaborative', icon: <Users className="w-4 h-4" /> },
  };

  const presets = recommendationAdmin.getPresets();

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-stone-600" />
            <h2 className="text-xl font-bold text-stone-900">Recommendation Settings</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              <Save className="w-4 h-4 inline mr-2" />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          {[
            { id: 'weights', label: 'Weights' },
            { id: 'settings', label: 'Settings' },
            { id: 'metrics', label: 'Metrics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'weights' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-stone-600 mb-3">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetApply(preset.name)}
                    className="px-4 py-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {(Object.keys(settings.weights) as Array<keyof RecommendationWeights>).map(key => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2 text-sm text-stone-600">
                    {weightLabels[key].icon}
                    <span>{weightLabels[key].label}</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(settings.weights[key] * 100)}
                    onChange={(e) => handleWeightChange(key, parseInt(e.target.value) / 100)}
                    className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  
                  <span className="w-12 text-sm font-medium text-stone-900 text-right">
                    {Math.round(settings.weights[key] * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'enabled', label: 'Recommendations Enabled' },
                { key: 'personalizationEnabled', label: 'Personalization' },
                { key: 'collaborativeEnabled', label: 'Collaborative Filtering' },
                { key: 'seasonalEnabled', label: 'Seasonal Recommendations' },
                { key: 'popularityBoost', label: 'Popularity Boost' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <span className="font-medium text-stone-900">{item.label}</span>
                  <button
                    onClick={() => toggleFeature(item.key as any)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      (settings as any)[item.key] ? 'bg-amber-500' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        (settings as any)[item.key] ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Min Score Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.minScoreThreshold}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    recommendationAdmin.setMinScoreThreshold(value, 'admin');
                    loadData();
                  }}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Max Recommendations
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxRecommendations}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    recommendationAdmin.setMaxRecommendations(value, 'admin');
                    loadData();
                  }}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Impressions" value={metrics.impressions.toLocaleString()} icon={<Sparkles className="w-5 h-5" />} />
              <MetricCard label="Clicks" value={metrics.clicks.toLocaleString()} icon={<TrendingUp className="w-5 h-5" />} />
              <MetricCard label="Bookings" value={metrics.bookings.toLocaleString()} icon={<BarChart3 className="w-5 h-5" />} />
              <MetricCard label="Revenue" value={`$${metrics.revenue.toLocaleString()}`} icon={<Star className="w-5 h-5" />} highlight />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm text-stone-600">Click-Through Rate</p>
                <p className="text-2xl font-bold text-stone-900">{(metrics.clickThroughRate * 100).toFixed(2)}%</p>
              </div>
              
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-sm text-stone-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-stone-900">{(metrics.conversionRate * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function MetricCard({ label, value, icon, highlight }: MetricCardProps) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-amber-50' : 'bg-stone-50'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
        highlight ? 'bg-amber-100 text-amber-600' : 'bg-stone-200 text-stone-600'
      }`}>
        {icon}
      </div>
      <p className="text-sm text-stone-600">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-amber-900' : 'text-stone-900'}`}>{value}</p>
    </div>
  );
}
