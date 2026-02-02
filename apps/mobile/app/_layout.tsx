import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Study Tree' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="trees" options={{ title: 'My Trees' }} />
      </Stack>
    </QueryClientProvider>
  );
}
