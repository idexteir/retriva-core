import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Image } from 'react-native';
import { getProperties, deleteProperty, togglePropertyStatus } from '../api/properties';

export default function ManagePropertiesScreen({ navigation }) {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const data = await getProperties(false);
    setProperties(data);
  };

  const handleDelete = (id, title) => {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteProperty(id);
        loadProperties();
      }},
    ]);
  };

  const handleToggle = async (id, status) => {
    await togglePropertyStatus(id, status);
    loadProperties();
  };

  const renderItem = ({ item }) => {
    const thumbnailUri = item.images[item.thumbnailIndex || 0] || item.images[0] || 'https://via.placeholder.com/400x300';
    
    return (
      <View style={styles.card}>
        <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>
            {item.price && item.price > 0 ? `SAR ${Number(item.price).toLocaleString()}` : 'Call for Price'}
          </Text>
          <Text style={styles.status}>{item.status.toUpperCase()}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('AddEditProperty', { id: item.id })}>
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => handleToggle(item.id, item.status)}>
              <Text style={styles.btnText}>{item.status === 'active' ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => handleDelete(item.id, item.title)}>
              <Text style={styles.btnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditProperty')}>
        <Text style={styles.addBtnText}>+ Add New</Text>
      </TouchableOpacity>
      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  addBtn: { margin: 16, backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden' },
  thumbnail: { width: '100%', height: 150, backgroundColor: '#f3f4f6' },
  cardContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#111827' },
  price: { fontSize: 16, color: '#2563eb', fontWeight: '600', marginBottom: 4 },
  status: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, backgroundColor: '#2563eb', padding: 10, borderRadius: 6, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
