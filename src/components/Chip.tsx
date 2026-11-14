import { Pressable, StyleSheet, Text } from 'react-native';

// Small pill button reused for filters and categories.
export default function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E8ECF0', marginRight: 8 },
  chipActive: { backgroundColor: '#265D97' },
  text: { color: '#33475B', fontSize: 13 },
  textActive: { color: '#FFFFFF' },
});
