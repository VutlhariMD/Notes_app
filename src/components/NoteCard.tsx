import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Note } from '../types';

type NoteProps={
    note: Note; 
    onPress: () => void
}

export default function NoteCard({note, onPress}: NoteProps){

 const date = new Date(note.updatedAt ?? note.createdAt).toLocaleDateString();


 return(
      <Pressable onPress={onPress}>
        <View>
            <Text>
                {note.title}
            </Text>
        </View>
        <Text>
            {note.text}
        </Text>
        <Text>
            {note.updatedAt? 'Edited': 'Added'}
            {date}
        </Text>
      </Pressable>

 );

}