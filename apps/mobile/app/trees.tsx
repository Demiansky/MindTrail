import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createAPIClient, TreeDTO } from '@studytree/shared';

const apiClient = createAPIClient(
  'http://localhost:8000',
  'http://localhost:8001'
);

export default function Trees() {
  const router = useRouter();

  const { data: trees, isLoading } = useQuery({
    queryKey: ['trees'],
    queryFn: async () => {
      const tokensStr = await SecureStore.getItemAsync('auth_tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        apiClient.setTokens(tokens);
      }
      return apiClient.listTrees();
    },
  });

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_tokens');
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading trees...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trees</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {trees && trees.length === 0 && (
        <Text style={styles.emptyText}>No trees yet. Create one on the web app!</Text>
      )}

      <FlatList
        data={trees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: TreeDTO }) => (
          <TouchableOpacity style={styles.treeCard}>
            <Text style={styles.treeTitle}>{item.title}</Text>
            <Text style={styles.treeInfo}>
              {item.node_count} nodes • {item.visibility}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.note}>
        Full tree editor coming soon! Use web app for now.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#0066cc',
    fontSize: 16,
  },
  treeCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  treeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  treeInfo: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    padding: 16,
  },
  note: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 16,
  },
});
