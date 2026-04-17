import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async set(key: string, value: any) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(`@budgetwise_${key}`, jsonValue);
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  },
  
  async get(key: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(`@budgetwise_${key}`);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading from storage', e);
      return null;
    }
  },

  async setWithTimestamp(key: string, value: any) {
    const payload = {
      data: value,
      timestamp: Date.now()
    };
    await this.set(key, payload);
  },

  async getWithMaxAge(key: string, maxAgeMs: number) {
    const payload = await this.get(key);
    if (!payload || !payload.timestamp) return null;
    
    if (Date.now() - payload.timestamp > maxAgeMs) {
      return null; // Expired
    }
    return payload.data;
  },

  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(`@budgetwise_${key}`);
    } catch (e) {
      console.error('Error removing from storage', e);
    }
  }
};
