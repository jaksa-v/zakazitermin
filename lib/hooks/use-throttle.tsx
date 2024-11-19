import { useEffect, useRef, useState } from "react";

export const useThrottle = (value: string, delay: number): string => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = window.setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => {
      window.clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};
