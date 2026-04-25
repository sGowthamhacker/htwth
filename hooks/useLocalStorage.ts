import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const getInitial = () => initialValue instanceof Function ? initialValue() : initialValue;
    if (typeof window === 'undefined') {
      return getInitial();
    }
    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : null;
      return parsed !== null ? parsed : getInitial();
    } catch (error) {
      console.error(error);
      return getInitial();
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Use a functional update to get the latest state and ensure consistency
      setStoredValue(current => {
          const valueToStore = value instanceof Function ? value(current) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          // When the item is removed, e.newValue is null. 
          // We reset to initialValue in this case.
          if (e.newValue === null) {
              const getInitial = () => initialValue instanceof Function ? initialValue() : initialValue;
              setStoredValue(getInitial());
          } else {
              setStoredValue(JSON.parse(e.newValue));
          }
        } catch (error) {
          console.error(`Error parsing new value for ${key} from storage event`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;