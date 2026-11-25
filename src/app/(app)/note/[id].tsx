import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, StyleSheet ,Platform} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotes } from '../../../context/NotesContext';
import { Category } from '../../../types';

// Adjust these to match the values in your Category type
const CATEGORIES: Category[] = ['work', 'study', 'personal'];

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote } = useNotes();

  const isNew = id === 'new';
  const existing = isNew ? undefined : notes.find((n) => n.id === id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [text, setText] = useState(existing?.text ?? '');
  const [category, setCategory] = useState<Category>(existing?.category ?? CATEGORIES[0]);
  const [error, setError] = useState('');

  if (!isNew && !existing) {
    return (
      <View style={styles.center}>
        <Text>Note not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  async function handleSave() {
    if (!text.trim()) {
      setError('Note text is required');
      return;
    }
    if (isNew) {
      await addNote({ title, text, category });
    } else {
      await updateNote(id, { title, text, category });
    }
    router.back();
  }

async function removeNote() {
  await deleteNote(id);
  router.back();
}

function handleDelete() {
  if (Platform.OS === 'web') {
    // Alert buttons don't work on web, so use the browser's confirm box
    if (window.confirm('Delete this note? This cannot be undone.')) {
      removeNote();
    }
    return;
  }

  Alert.alert('Delete note', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: removeNote },
  ]);
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{isNew ? 'New note' : 'Edit note'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Title (optional)"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your note..."
        value={text}
        onChangeText={(t) => {
          setText(t);
          setError('');
        }}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.row}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipActive]}
          >
            <Text style={category === c && styles.chipTextActive}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{isNew ? 'Add note' : 'Save changes'}</Text>
      </Pressable>

      {!isNew && (
        <Pressable onPress={handleDelete}>
          <Text style={styles.delete}>Delete note</Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, gap: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  heading: { fontSize: 24, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { minHeight: 140 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  chipActive: { backgroundColor: '#222', borderColor: '#222' },
  chipTextActive: { color: '#fff' },
  error: { color: 'red' },
  saveButton: { backgroundColor: '#222', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  delete: { color: 'red', textAlign: 'center', marginTop: 6 },
  link: { color: '#0066cc', textAlign: 'center' },
});