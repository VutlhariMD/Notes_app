import { Text, View ,Button} from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
   const {logout}=useAuth()
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>HOME PLACEHOLDER</Text>
            <Button title="Log out" onPress={logout}></Button>
    </View>
  );
}