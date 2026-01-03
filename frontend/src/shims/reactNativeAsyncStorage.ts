type MaybeString = string | null;

const memoryStore = new Map<string, string>();

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

const AsyncStorage = {
  async getItem(key: string): Promise<MaybeString> {
    if (hasLocalStorage()) return window.localStorage.getItem(key);
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (hasLocalStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (hasLocalStorage()) {
      window.localStorage.removeItem(key);
      return;
    }
    memoryStore.delete(key);
  },

  async clear(): Promise<void> {
    if (hasLocalStorage()) {
      window.localStorage.clear();
      return;
    }
    memoryStore.clear();
  },

  async getAllKeys(): Promise<string[]> {
    if (hasLocalStorage()) return Object.keys(window.localStorage);
    return Array.from(memoryStore.keys());
  },

  async multiGet(keys: string[]): Promise<Array<[string, MaybeString]>> {
    const entries = await Promise.all(keys.map(async (k) => [k, await AsyncStorage.getItem(k)] as [string, MaybeString]));
    return entries;
  },

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    await Promise.all(keyValuePairs.map(([k, v]) => AsyncStorage.setItem(k, v)));
  },

  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => AsyncStorage.removeItem(k)));
  },
};

export default AsyncStorage;
export { AsyncStorage };
