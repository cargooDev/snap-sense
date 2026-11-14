import { ActivityIndicator, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import Chip from '../components/Chip';
import { useGallery } from '../viewmodels/useGallery';
import { CATEGORIES, Filter } from '../types';

const COLUMNS = 3;
const GAP = 2;
// Tile size = (screen width minus the gaps between tiles) / number of columns.
const TILE = (Dimensions.get('window').width - GAP * (COLUMNS - 1)) / COLUMNS;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: '★ Favourites' },
  { key: 'reminders', label: '⏰ Reminders' },
];

export default function GalleryScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const vm = useGallery();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR SCREENSHOTS</Text>
          <Text style={styles.title}>SnapSense</Text>
        </View>
        <Pressable style={styles.addButton} onPress={vm.importManually}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Find details from screenshots without scrolling through your camera roll.</Text>
      <TextInput
        style={styles.search}
        placeholder="Search saved text or category"
        value={vm.text}
        onChangeText={vm.setText}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} active={vm.filter === f.key} onPress={() => vm.setFilter(f.key)} />
        ))}
        {CATEGORIES.map((c) => (
          // tapping the active category again clears it
          <Chip key={c} label={c} active={vm.category === c} onPress={() => vm.setCategory(vm.category === c ? null : c)} />
        ))}
      </ScrollView>

      {(vm.needsFallback || vm.message) && (
        <Pressable style={styles.banner} onPress={vm.importManually}>
          <Text style={styles.bannerText}>{vm.message || 'Can’t read the device gallery. Tap here to choose screenshots manually.'}</Text>
        </Pressable>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{vm.filter === 'all' && !vm.category ? 'Recent screenshots' : 'Filtered screenshots'}</Text>
        <Text style={styles.count}>{vm.items.length} {vm.items.length === 1 ? 'item' : 'items'}</Text>
      </View>

      <FlatList
        data={vm.items}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        columnWrapperStyle={{ gap: GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        ListEmptyComponent={
          vm.isSyncing
            ? <View style={styles.empty}><ActivityIndicator color="#265D97" /><Text style={styles.emptyText}>Checking your screenshots…</Text></View>
            : <View style={styles.empty}><Text style={styles.emptyTitle}>No screenshots yet</Text><Text style={styles.emptyText}>Use Add to select an image from your phone for this demo.</Text></View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpen(item.id)}>
            <Image source={{ uri: item.id }} style={{ width: TILE, height: TILE }} contentFit="cover" />
            {item.isFavorite && <Text style={styles.badge}>★</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9', paddingTop: 54 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: '#627083' },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, color: '#162232', marginTop: 2 },
  subtitle: { color: '#627083', lineHeight: 20, marginTop: 8, marginHorizontal: 20 },
  addButton: { backgroundColor: '#265D97', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700' },
  search: { margin: 20, marginBottom: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E5EA', color: '#162232' },
  chips: { paddingHorizontal: 20, flexGrow: 0, marginBottom: 14 },
  banner: { marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: '#FFF4DB' },
  bannerText: { color: '#6E4C00', lineHeight: 19 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, marginBottom: 10 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#162232' },
  count: { fontSize: 13, color: '#627083' },
  empty: { alignItems: 'center', marginTop: 54, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#162232', marginBottom: 6 },
  emptyText: { textAlign: 'center', color: '#627083', lineHeight: 20, marginTop: 10 },
  badge: { position: 'absolute', top: 4, right: 6, color: '#F6C343', fontSize: 16 },
});
