import { useState, useEffect } from 'react';

interface AnalyticsData {
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  overview: {
    total_views: number;
    unique_visitors: number;
    avg_views_per_day: number;
  };
  language_breakdown: Array<{
    language: string;
    views: number;
    percentage: number;
  }>;
  peak_times: Array<{
    hour: number;
    time_label: string;
    views: number;
  }>;
  daily_trend: Array<{
    date: string;
    views: number;
  }>;
  section_breakdown: Array<{
    section: string;
    views: number;
  }>;
}

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface AnalyticsWidgetProps {
  className?: string;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/providers/analytics?days=30', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setAnalytics(result.data);
        } else {
          setError(result.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Page Analytics</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Page Analytics</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto text-gray-300 mb-4">
            <EyeIcon />
          </div>
          <p className="text-sm text-gray-500">
            {error || 'No analytics data available yet'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Views will appear here once your page gets visitors
          </p>
        </div>
      </div>
    );
  }

  const topLanguage = analytics.language_breakdown[0];
  const topPeakTime = analytics.peak_times[0];

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Page Analytics</h3>
        <span className="text-xs text-gray-500">Last 30 days</span>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 text-blue-600">
            <EyeIcon />
          </div>
          <p className="text-2xl font-bold text-blue-600">{analytics.overview.total_views}</p>
          <p className="text-xs text-blue-600">Total Views</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 text-green-600">
            <UsersIcon />
          </div>
          <p className="text-2xl font-bold text-green-600">{analytics.overview.unique_visitors}</p>
          <p className="text-xs text-green-600">Unique Visitors</p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        {/* Top Language */}
        {topLanguage && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 text-gray-400">
                <GlobeIcon />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Most Common Language</p>
                <p className="text-xs text-gray-500">
                  {topLanguage.language.toUpperCase()} ({topLanguage.percentage}% of views)
                </p>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-700">{topLanguage.views}</span>
          </div>
        )}

        {/* Peak Time */}
        {topPeakTime && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 text-gray-400">
                <ClockIcon />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Peak Viewing Time</p>
                <p className="text-xs text-gray-500">
                  Most views at {topPeakTime.time_label}
                </p>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-700">{topPeakTime.views}</span>
          </div>
        )}

        {/* Average Views */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 text-gray-400">
              <EyeIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Daily Average</p>
              <p className="text-xs text-gray-500">
                Views per day over {analytics.period.days} days
              </p>
            </div>
          </div>
          <span className="text-lg font-semibold text-gray-700">
            {analytics.overview.avg_views_per_day}
          </span>
        </div>
      </div>

      {/* Language Breakdown */}
      {analytics.language_breakdown.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Viewer Languages</h4>
          <div className="space-y-2">
            {analytics.language_breakdown.slice(0, 3).map((lang, index) => (
              <div key={lang.language} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 uppercase">{lang.language}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(lang.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{lang.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsWidget;