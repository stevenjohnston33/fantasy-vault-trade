import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initZama = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Initializing FHE SDK...');
        await initSDK();
        console.log('✅ FHE SDK initialized successfully');

        console.log('🔄 Creating FHE instance...');
        const zamaInstance = await createInstance(SepoliaConfig);
        console.log('✅ FHE instance created successfully');

        if (mounted) {
          setInstance(zamaInstance);
          console.log('✅ FHE instance ready for use');
        }
      } catch (err) {
        console.error('❌ Failed to initialize Zama instance:', err);
        if (mounted) {
          setError(`Failed to initialize encryption service: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initZama();

    return () => {
      mounted = false;
    };
  }, []);

  return { instance, isLoading, error };
}
