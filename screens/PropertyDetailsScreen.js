import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Modal, Alert, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { getPropertyById } from '../api/properties';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState('');

  useEffect(() => {
    loadProperty();
  }, []);

  const loadProperty = async () => {
    const data = await getPropertyById(id);
    setProperty(data);
  };

  const openImageModal = (uri) => {
    setSelectedImageUri(uri);
    setImageModalVisible(true);
  };

  const downloadImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Storage permission is required to download images');
        return;
      }

      const filename = selectedImageUri.split('/').pop();
      const fileUri = FileSystem.documentDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(selectedImageUri, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Retriva', asset, false);

      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image');
    }
  };

  if (!property) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : ['https://via.placeholder.com/800x600'];
  const displayPrice = property.price && Number(property.price) > 0 
    ? `SAR ${Number(property.price).toLocaleString()}` 
    : 'Call for Price';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((uri, index) => (
              <TouchableOpacity key={index} onPress={() => openImageModal(uri)} activeOpacity={0.9}>
                <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View key={index} style={[styles.dot, currentImageIndex === index && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.title}>{String(property.title || 'Untitled')}</Text>
            <View style={styles.location}>
              <Text style={styles.locationIcon}>{'📍'}</Text>
              <Text style={styles.locationText}>{String(property.area || 'N/A')}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{'Category'}</Text>
              <Text style={styles.infoValue}>{String(property.category || 'N/A')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{'Status'}</Text>
              <Text style={[styles.infoValue, property.status === 'active' ? styles.statusActive : styles.statusHidden]}>
                {String(property.status || 'N/A').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>{'Rental Pricing'}</Text>
            <View style={styles.pricingGrid}>
              <Text style={styles.price}>{displayPrice}</Text>
              {property.price && Number(property.price) > 0 ? (
                <Text style={styles.pricingNote}>{'per night'}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>{'Description'}</Text>
            <Text style={styles.description}>{String(property.description || 'No description available')}</Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>{'Contact Us'}</Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>{'📞 Call Now'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>{'💬 WhatsApp'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('AddEditProperty', { id: property.id })}
            >
              <Text style={styles.editButtonText}>{'✏️ Edit Property'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImageUri }} style={styles.zoomedImage} resizeMode="contain" />
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setImageModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{'✕'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.downloadButton} 
                onPress={downloadImage}
              >
                <Text style={styles.downloadButtonText}>{'⬇ Download'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  gallery: { position: 'relative', backgroundColor: '#000' },
  galleryImage: { width, height: 300 },
  pagination: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff' },
  details: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationIcon: { fontSize: 16 },
  locationText: { fontSize: 16, color: '#6b7280' },
  infoGrid: { flexDirection: 'row', gap: 16, marginBottom: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', fontWeight: '600' },
  infoValue: { fontSize: 16, color: '#111827', fontWeight: '600' },
  statusActive: { color: '#10b981' },
  statusHidden: { color: '#6b7280' },
  pricingSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  pricingGrid: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12 },
  price: { fontSize: 32, fontWeight: 'bold', color: '#2563eb' },
  pricingNote: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  descriptionSection: { marginBottom: 24 },
  description: { fontSize: 16, lineHeight: 24, color: '#4b5563' },
  contactSection: { marginBottom: 24 },
  contactButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  contactButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  adminActions: { marginTop: 16, paddingTop: 24, borderTopWidth: 1, borderColor: '#e5e7eb' },
  editButton: { backgroundColor: '#6b7280', padding: 16, borderRadius: 12, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '80%' },
  closeButton: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  downloadButton: { position: 'absolute', bottom: 50, backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  downloadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
