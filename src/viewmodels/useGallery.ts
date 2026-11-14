import { useCallback, useEffect, useState } from 'react';
import * as db from '../db/database';
import { importFromPicker, syncDeviceScreenshots } from '../services/screenshots';
import { Category, Filter, Screenshot } from '../types';

// ViewModel for the gallery screen. It owns the state (search text, chips, list)
// and exposes actions; the screen itself only draws what it is given.
export function useGallery() {
  const [items, setItems] = useState<Screenshot[]>([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState<Category | null>(null);
  const [needsFallback, setNeedsFallback] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [message, setMessage] = useState('');

  // Re-run the SQL query. Called whenever a criterion changes or data changes.
  const reload = useCallback(async () => {
    setItems(await db.query({ text, filter, category }));
  }, [text, filter, category]);

  useEffect(() => { reload(); }, [reload]);

  // Runs once on start: copy new device screenshots into the database.
  useEffect(() => {
    (async () => {
      try {
        const granted = await syncDeviceScreenshots();
        setNeedsFallback(!granted);
        await reload();
      } catch {
        setNeedsFallback(true); // e.g. media library unavailable in this runtime
        setMessage('Your gallery could not be read. You can still add images manually.');
      } finally {
        setIsSyncing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const importManually = async () => {
    try {
      const count = await importFromPicker();
      if (count > 0) {
        setMessage(`${count} image${count === 1 ? '' : 's'} added to SnapSense.`);
        setNeedsFallback(false);
        await reload();
      }
    } catch {
      setMessage('The selected images could not be added. Please try again.');
    }
  };

  return {
    items, text, setText, filter, setFilter, category, setCategory,
    needsFallback, isSyncing, message, importManually, reload,
  };
}
