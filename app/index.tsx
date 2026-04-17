import { Redirect } from 'expo-router';

export default function Index() {
  // Currently, we redirect to auth.
  // In Phase 2, here we will check AuthContext and either redirect to /(app)/dashboard or /(auth)/login
  return <Redirect href="/(auth)/login" />;
}
