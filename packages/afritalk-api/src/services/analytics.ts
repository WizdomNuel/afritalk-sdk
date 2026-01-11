// Simple in-memory analytics store.
// In a production environment, this should be replaced with Redis, Prometheus, or a proper database.

interface AnalyticsData {
  totalRequests: number;
  endpoints: Record<string, number>;
  languages: Record<string, number>;
}

const stats: AnalyticsData = {
  totalRequests: 0,
  endpoints: {},
  languages: {}
};

export const AnalyticsService = {
  trackRequest: (endpoint: string) => {
    stats.totalRequests++;
    stats.endpoints[endpoint] = (stats.endpoints[endpoint] || 0) + 1;
  },

  trackLanguage: (language: string) => {
    if (!language) return;
    const normalized = language.toLowerCase();
    stats.languages[normalized] = (stats.languages[normalized] || 0) + 1;
  },

  getStats: () => {
    // Return a copy to prevent mutation issues
    return JSON.parse(JSON.stringify(stats));
  }
};
