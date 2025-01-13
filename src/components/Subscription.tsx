import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SubscriptionProps {
  username: string; // Username to fetch the subscription details
}

const Subscription: React.FC<SubscriptionProps> = ({ username }) => {
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [isRedZone, setIsRedZone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRemainingDays = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Invoke the backend function
        const response = await invoke<{
          remainingDays: number;
          isRedZone: boolean;
        }>('get_remaining_days', { username });

        setRemainingDays(response.remainingDays);
        setIsRedZone(response.isRedZone);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch subscription status.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemainingDays();

    // Optional: Refresh daily
    const interval = setInterval(fetchRemainingDays, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [username]);

  if (isLoading) {
    return <p>Loading subscription status...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      {remainingDays !== null ? (
        <p
          style={{
            color: isRedZone ? 'red' : 'black',
            fontWeight: isRedZone ? 'bold' : 'normal',
          }}
        >
          {remainingDays > 0
            ? `Days remaining: ${remainingDays}`
            : 'Subscription has expired.'}
        </p>
      ) : (
        <p>Unable to fetch subscription status.</p>
      )}
    </div>
  );
};

export default Subscription;
