import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import GalleryScreen from './src/screens/GalleryScreen';
import DetailScreen from './src/screens/DetailScreen';

// Two screens only, so plain state is enough for navigation: no router library.
// `selectedId` is the uri of the open screenshot, or null for the gallery.
export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <StatusBar style="dark" />
      {selectedId === null
        ? <GalleryScreen onOpen={setSelectedId} />
        : <DetailScreen id={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}
