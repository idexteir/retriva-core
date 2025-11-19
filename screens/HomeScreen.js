import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import { getProperties, getCategories, getAreas } from '../api/properties';

export default function HomeScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedArea, properties]);

  const loadData = async () => {
    try {
      const [props, cats, ars] = await Promise.all([
        getProperties(true),
        getCategories(),
        getAreas(),
      ]);
      setProperties(props);
      setCategories(cats);
      setAreas(ars);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];
    if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory);
    if (selectedArea !== 'all') filtered = filtered.filter(p => p.area === selectedArea);
    setFilteredProperties(filtered);
  };

  const renderItem = ({ item }) => {
    const thumbnailUri = item.images?.[item.thumbnailIndex || 0] || item.images?.[0] || 'https://via.placeholder.com/400x300';
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PropertyDetails', { id: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: thumbnailUri }} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title || 'Untitled'}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description || ''}</Text>
          <Text style={styles.meta}>{item.category || 'N/A'} • {item.area || 'N/A'}</Text>
          <Text style={styles.price}>
            {item.price && item.price > 0 ? `SAR ${Number(item.price).toLocaleString()}` : 'Call for Price'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Properties</Text>
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => navigation.navigate('ManageProperties')}
        >
          <Text style={styles.manageBtnText}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.filterChip, selectedCategory === c.name && styles.filterChipActive]}
              onPress={() => setSelectedCategory(c.name)}
            >
              <Text style={[styles.filterChipText, selectedCategory === c.name && styles.filterChipTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Area Filter Chips */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Area</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedArea === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedArea('all')}
          >
            <Text style={[styles.filterChipText, selectedArea === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {areas.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[styles.filterChip, selectedArea === a.name && styles.filterChipActive]}
              onPress={() => setSelectedArea(a.name)}
            >
              <Text style={[styles.filterChipText, selectedArea === a.name && styles.filterChipTextActive]}>
                {a.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
        </Text>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  manageBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  manageBtnText: { color: '#fff', fontWeight: '600' },
  filterSection: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterScroll: { flexDirection: 'row' },
  filterChip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#d1d5db' },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  resultsCount: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  resultsCountText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 200, overflow: 'hidden', backgroundColor: '#f3f4f6' },
  image: { width: '100%', height: '100%' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 4, color: '#111827' },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  meta: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
});
