import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { storage } from '../lib/storage';

interface CurrencyContextType {
  rates: Record<string, number>;
  loading: boolean;
  convert: (amount: number, from: string, to: string) => number;
  formatCurrency: (amount: number, currencyCode: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Fallback rates for when APIs are blocked by CORS (common on Web localhost)
const FALLBACK_RATES: Record<string, number> = {
  'USD': 1,
  'EUR': 0.94,
  'GBP': 0.80,
  'JPY': 154,
  'CAD': 1.38,
  'AUD': 1.55,
  'JMD': 155,
  'SAR': 3.75,
  'BRL': 5.25,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchRates = useCallback(async (base: string) => {
    try {
      // 1. Check offline cache
      const cachedRates = await storage.getWithMaxAge(`rates_${base}`, CACHE_TTL);
      if (cachedRates) {
        setRates(cachedRates);
        setLoading(false);
        return;
      }

      // 2. Fetch live if cache expired or missing
      if (!process.env.EXPO_PUBLIC_EXCHANGE_API_KEY) {
        throw new Error('Exchange API key missing');
      }

      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXPO_PUBLIC_EXCHANGE_API_KEY}/latest/${base}`
      );
      
      const newRates = response.data.conversion_rates;
      setRates(newRates);
      
      // Save to cache
      await storage.setWithTimestamp(`rates_${base}`, newRates);
    } catch (error: any) {
      console.error('Failed to fetch exchange rates:', error);
      
      // CORS or Network Fallback: Use hardcoded rates if we're on web and fetch fails
      if (Object.keys(rates).length === 0) {
        console.warn('Using fallback exchange rates due to network/CORS failure.');
        setRates(FALLBACK_RATES);
      }

      // Fallback: try to grab expired cache if network totally fails
      const expiredCache = await storage.get(`rates_${base}`);
      if (expiredCache && expiredCache.data) {
        setRates(expiredCache.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // We always assume the DB uses USD as a base anchor, or the user's primary currency
    // For this context, standardizing on fetching against USD simplifies matrix calculation
    // Or we fetch directly against user's primary currency. Let's do primary.
    if (profile?.primary_currency) {
      fetchRates(profile.primary_currency);
    } else {
      fetchRates('USD');
    }
  }, [profile?.primary_currency, fetchRates]);

  const convert = useCallback((amount: number, from: string, to: string) => {
    if (from === to) return amount;
    
    // If the user has a pinned manual rate, override live rates for primary<->secondary conversions
    if (profile?.rate_mode === 'manual' && profile?.manual_rate) {
      if (from === profile.primary_currency && to === profile.secondary_currency) {
        return amount * profile.manual_rate;
      }
      if (to === profile.primary_currency && from === profile.secondary_currency) {
        return amount / profile.manual_rate;
      }
    }

    // Default to live rates
    if (!rates || Object.keys(rates).length === 0) return amount;

    // Rates are anchored to the fetched base (profile.primary_currency)
    // If 'from' is the anchor:
    if (from === (profile?.primary_currency || 'USD')) {
      const liveRate = rates[to];
      return liveRate ? amount * liveRate : amount;
    }
    
    // If 'to' is the anchor:
    if (to === (profile?.primary_currency || 'USD')) {
      const liveRate = rates[from];
      return liveRate ? amount / liveRate : amount;
    }

    // Cross-rate calculation
    const fromRate = rates[from];
    const toRate = rates[to];
    if (fromRate && toRate) {
      return (amount / fromRate) * toRate;
    }

    return amount;
  }, [rates, profile]);

  const formatCurrency = useCallback((amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  return (
    <CurrencyContext.Provider value={{ rates, loading, convert, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
