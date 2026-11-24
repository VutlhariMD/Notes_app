import { Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>So this is the page that is displayed, the first page to be displayed auth
        (app) -index.ts
        
      </Text>
    </View>
  );
}