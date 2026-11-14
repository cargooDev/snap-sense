import { useCallback, useEffect, useState } from 'react';
import * as db from '../db/database';
import { analyseImage } from '../services/gemini';
import { cancelReminder, scheduleReminder } from '../services/reminders';
import { deleteFromDevice } from '../services/screenshots';
import { Screenshot } from '../types';

export type AnalysisStatus = 'idle' | 'loading' | 'error';

// ViewModel for the detail screen: loads one screenshot, analyses it if needed,
// and performs the three suggested actions (reminder, favourite, delete).
export function useDetail(id: string) {
  const [item, setItem] = useState<Screenshot | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => setItem(await db.getById(id)), [id]);

  const analyse = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const result = await analyseImage(id);
      await db.saveAnalysis(id, result.text, result.category, result.summary);
      setStatus('idle');
      await refresh();
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Analysis failed');
    }
  }, [id, refresh]);

  // On open: show what we have, and only call the AI if there is no saved result.
  useEffect(() => {
    (async () => {
      const row = await db.getById(id);
      setItem(row);
      if (row && row.ocrText === null) analyse();
    })();
  }, [id, analyse]);

  const toggleFavorite = async () => {
    if (!item) return;
    await db.setFavorite(id, !item.isFavorite);
    await refresh();
  };

  const remindIn = async (hours: number) => {
    if (!item) return;
    try {
      await cancelReminder(item.notificationId); // replace any earlier reminder
      const when = new Date(Date.now() + hours * 3600 * 1000);
      const body = item.summary ?? 'Check your saved screenshot';
      const notificationId = await scheduleReminder('Screenshot reminder', body, when);
      await db.setReminder(id, when.getTime(), notificationId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not set reminder');
    }
  };

  const clearReminder = async () => {
    if (!item) return;
    await cancelReminder(item.notificationId);
    await db.setReminder(id, null, null);
    await refresh();
  };

  // Returns true when deleted so the screen can close itself.
  const deleteScreenshot = async () => {
    if (!item) return false;
    try {
      await cancelReminder(item.notificationId);
      await deleteFromDevice(item.assetId);
      await db.remove(id);
      return true;
    } catch {
      setError('Could not delete the file');
      return false;
    }
  };

  return { item, status, error, analyse, toggleFavorite, remindIn, clearReminder, deleteScreenshot };
}
