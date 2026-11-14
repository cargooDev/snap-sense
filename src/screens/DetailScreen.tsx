import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useDetail } from '../viewmodels/useDetail';

// Button used for the suggested actions.
function Action({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.action, danger && styles.danger]}>
      <Text style={[styles.actionText, danger && { color: '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

export default function DetailScreen({ id, onClose }: { id: string; onClose: () => void }) {
  const vm = useDetail(id);
  const { item } = vm;

  const confirmDelete = () =>
    Alert.alert('Delete screenshot?', 'This removes it from the app and the device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { if (await vm.deleteScreenshot()) onClose(); } },
    ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Pressable onPress={onClose}><Text style={styles.back}>← Back</Text></Pressable>
      <Image source={{ uri: id }} style={styles.image} contentFit="contain" />

      {/* The three analysis states: loading, error, or result */}
      {vm.status === 'loading' && (
        <View style={styles.card}><ActivityIndicator /><Text style={styles.muted}>Analysing screenshot…</Text></View>
      )}
      {vm.status === 'error' && (
        <View style={styles.card}>
          <Text style={styles.errorText}>{vm.error}</Text>
          <Action label="Try again" onPress={vm.analyse} />
        </View>
      )}
      {item?.ocrText !== null && item && vm.status === 'idle' && (
        <View style={styles.card}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.summary}>{item.summary}</Text>
          <Text style={styles.label}>Extracted text</Text>
          <Text selectable style={styles.body}>{item.ocrText || '(no text found)'}</Text>
        </View>
      )}

      {item && (
        <View style={styles.card}>
          <Text style={styles.label}>Suggested actions</Text>
          <View style={styles.row}>
            <Action label={item.isFavorite ? '★ Unmark important' : '☆ Mark important'} onPress={vm.toggleFavorite} />
            <Action label="Remind in 1 h" onPress={() => vm.remindIn(1)} />
            <Action label="Remind tomorrow" onPress={() => vm.remindIn(24)} />
            <Action label="Delete" onPress={confirmDelete} danger />
          </View>
          {item.reminderAt && (
            <Pressable onPress={vm.clearReminder}>
              <Text style={styles.muted}>
                Reminder set for {new Date(item.reminderAt).toLocaleString()} — tap to cancel
              </Text>
            </Pressable>
          )}
          {vm.status !== 'error' && vm.error !== '' && <Text style={styles.errorText}>{vm.error}</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB', paddingTop: 48 },
  back: { padding: 16, fontSize: 16, color: '#1B1F4B' },
  image: { width: '100%', height: 360, backgroundColor: '#E3E6F0' },
  card: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF' },
  category: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#8E7CFF', color: '#FFFFFF', textTransform: 'capitalize', overflow: 'hidden' },
  summary: { fontSize: 16, color: '#1B1F4B', marginVertical: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#6A6F94', marginBottom: 6, textTransform: 'uppercase' },
  body: { color: '#1B1F4B', lineHeight: 20 },
  muted: { color: '#6A6F94', marginTop: 8 },
  errorText: { color: '#B3261E', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: '#ECEEF5' },
  actionText: { color: '#1B1F4B' },
  danger: { backgroundColor: '#B3261E' },
});
