import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface User {
  name: string;
  dateOfBirth: string;
  currentlyWorking: string;
  graduatedFrom: string;
}

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
        const response = await fetch('/api/getAllUsers');
        const data = await response.json();
        setUsers(data.users);
    };
    fetchUsers();
  }, []);


  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.headerText}>Our Community</ThemedText>
        
        {users.map((user, index) => (
          <ThemedView key={index} style={styles.userCard}>
            <ThemedView style={styles.userHeader}>
              <ThemedText type="subtitle">{user.name}</ThemedText>
              <ThemedText type="defaultSemiBold">{calculateAge(user.dateOfBirth)} years</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.userDetails}>
              <ThemedView style={styles.detailRow}>
                <ThemedText type="defaultSemiBold">🏢 Working at:</ThemedText>
                <ThemedText>{user.currentlyWorking}</ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.detailRow}>
                <ThemedText type="defaultSemiBold">🎓 Graduated from:</ThemedText>
                <ThemedText>{user.graduatedFrom}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding:16,
    borderRadius:10
  },
  userDetails: {
    gap: 8,
    padding:20,
    borderRadius:10
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
