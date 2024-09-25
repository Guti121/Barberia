import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Pressable } from 'react-native';
import { handleListUserPro } from '../axiosRequest/AxiosUser';
import { Link } from 'expo-router';




export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);
      const fetchUsers = async () => {
        try {
          const response = await handleListUserPro(query)
          
          setUsers(response.data);
        } catch (error) {
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [query]);

  return (
    <View>
      <TextInput
        placeholder="Buscar usuario..."
        value={query}
        onChangeText={setQuery}
        style={{ padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
      />
      {loading && <Text>Buscando...</Text>}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          <Link href= {{pathname:`/${item.id.toString()}`,
          params:{phonenumber:item.name}}} asChild>
            <Pressable>
              <Text>{item.username}</Text>
            </Pressable>
          </Link>
          }

      />
    </View>
  );
}
