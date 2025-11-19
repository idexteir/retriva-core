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
      {/* Search Bar / Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search properties...</Text>
        </View>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchContainer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  searchIcon: { fontSize: 18, opacity: 0.5 },
  searchPlaceholder: { fontSize: 16, color: '#94a3b8' },
  filterSection: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  filterScroll: { flexDirection: 'row' },
  filterChip: { backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  resultsCount: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  resultsCountText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 20, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 220, overflow: 'hidden', backgroundColor: '#f1f5f9' },
  image: { width: '100%', height: '100%' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#0f172a', letterSpacing: -0.5 },
  description: { fontSize: 15, color: '#64748b', marginBottom: 12, lineHeight: 22 },
  meta: { fontSize: 13, color: '#94a3b8', marginBottom: 12, fontWeight: '500' },
  price: { fontSize: 24, fontWeight: '800', color: '#2563eb', letterSpacing: -0.5 },
});
