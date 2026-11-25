import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotes } from '../context/NotesContext';
import { Category } from '../types';
import NoteCard from './NoteCard';

type Props = { title: string; category?: Category };

export default function NotesListView({ title, category }: Props) {
  const router = useRouter();
  const { notes } = useNotes();
  const [query, setQuery] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);

  const visibleNotes = useMemo(() => {
    const words = query.toLowerCase().split(' ').filter(Boolean);

    return notes
      .filter((n) => !category || n.category === category)
      .filter((n) => {
        const haystack = `${n.title ?? ''} ${n.text}`.toLowerCase();
        return words.every((w) => haystack.includes(w));
      })
      .sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return newestFirst ? -diff : diff;
      });
  }, [notes, category, query, newestFirst]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{title}</Text>

      <TextInput
        style={styles.search}
        placeholder="Search notes..."
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.row}>
        <Text style={styles.count}>{visibleNotes.length} note(s)</Text>
        <Pressable onPress={() => setNewestFirst((v) => !v)}>
          <Text style={styles.link}>
            Sort: {newestFirst ? 'Newest first' : 'Oldest first'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={visibleNotes}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <NoteCard note={item} onPress={() => router.push(`/note/${item.id}`)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query ? 'No notes match your search.' : 'No notes here yet. Tap + to add one.'}
          </Text>
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/note/new')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, gap: 12 },
  heading: { fontSize: 26, fontWeight: 'bold' },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  count: { color: '#666' },
  link: { color: '#0066cc' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },
});