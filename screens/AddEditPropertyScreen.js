import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Switch, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getPropertyById, createProperty, updateProperty, deleteProperty, getCategories, getAreas } from '../api/properties';

export default function AddEditPropertyScreen({ route, navigation }) {
  const id = route.params?.id;
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode); // Add loading state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isPriceEnabled, setIsPriceEnabled] = useState(false); // Add price toggle
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [status, setStatus] = useState('active');
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true); // Start loading
    
    try {
      const [cats, ars] = await Promise.all([getCategories(), getAreas()]);
      setCategories(cats);
      setAreas(ars);
      
      if (cats.length > 0) setCategory(cats[0].name);
      if (ars.length > 0) setArea(ars[0].name);

      if (id) {
        const prop = await getPropertyById(id);
        if (prop) {
          setTitle(prop.title);
          setDescription(prop.description);
          
          // Check if price exists and is greater than 0
          if (prop.price && prop.price > 0) {
            setPrice(prop.price.toString());
            setIsPriceEnabled(true);
          } else {
            setPrice('');
            setIsPriceEnabled(false);
          }
          
          setCategory(prop.category);
          setArea(prop.area);
          setImageUris(prop.images || []);
          setThumbnailIndex(prop.thumbnailIndex || 0);
          setStatus(prop.status);
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permission is required to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      setImageUris([...imageUris, newUri]);
      Alert.alert('Success', 'Image added! Tap "Upload Images" again to add more.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      setImageUris([...imageUris, newUri]);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImages },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const selectThumbnail = (index) => {
    setThumbnailIndex(index);
  };

  const removeImage = (index) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    if (!area) newErrors.area = 'Area is required';
    
    // Validate price if enabled
    if (isPriceEnabled) {
      if (!price || price.trim() === '') {
        newErrors.price = 'Price is required when enabled';
      } else if (isNaN(Number(price)) || Number(price) < 1) {
        newErrors.price = 'Price must be 1 or greater';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    const data = {
      title,
      description,
      price: isPriceEnabled && price ? parseFloat(price) : 0, // Set 0 if disabled
      category,
      area,
      images: imageUris,
      thumbnailIndex,
      status,
    };

    try {
      if (id) {
        await updateProperty(id, data);
        Alert.alert('Success', 'Property updated successfully');
      } else {
        await createProperty(data);
        Alert.alert('Success', 'Property created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save property');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(id);
              Alert.alert('Success', 'Property deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isEditMode ? 'Edit Property' : 'Add New Property'}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter property title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter property description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Show Price</Text>
            <Switch
              value={isPriceEnabled}
              onValueChange={(val) => {
                setIsPriceEnabled(val);
                if (!val) {
                  setPrice('');
                  setErrors({ ...errors, price: undefined });
                }
              }}
              trackColor={{ false: '#d1d5db', true: '#2563eb' }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.hint}>
            {isPriceEnabled ? 'Price will be displayed' : 'Will show "Call for Price"'
            }
          </Text>
        </View>

        {isPriceEnabled && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Price (SAR) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price (minimum 1 SAR)"
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={setCategory}>
              {categories.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.name} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Area <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={area} onValueChange={setArea}>
              {areas.map(a => (
                <Picker.Item key={a.id} label={a.name} value={a.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Image Upload Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Images</Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions}>
            <Text style={styles.uploadButtonText}>📷 Add Image</Text>
          </TouchableOpacity>

          {imageUris.length > 0 && (
            <>
              <Text style={styles.thumbnailInstructions}>
                Tap an image to set it as thumbnail for home page
              </Text>
              <View style={styles.imagePreviewContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {imageUris.map((uri, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <TouchableOpacity onPress={() => selectThumbnail(index)}>
                        <Image source={{ uri }} style={styles.previewImage} />
                        
                        {/* Thumbnail Badge */}
                        {thumbnailIndex === index && (
                          <View style={styles.thumbnailBadge}>
                            <Text style={styles.thumbnailBadgeText}>📌 Home Page</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          Alert.alert(
                            'Remove Image',
                            'Are you sure you want to remove this image?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Remove', 
                                style: 'destructive',
                                onPress: () => {
                                  removeImage(index);
                                  if (thumbnailIndex === index && imageUris.length > 1) {
                                    setThumbnailIndex(0);
                                  } else if (thumbnailIndex > index) {
                                    setThumbnailIndex(thumbnailIndex - 1);
                                  }
                                }
                              },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.removeImageText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
          
          <Text style={styles.hint}>
            {imageUris.length} image(s) selected. Image with 📌 will show on home page.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              value={status === 'active'}
              onValueChange={(val) => setStatus(val ? 'active' : 'hidden')}
              trackColor={{ false: '#d1d5db', true: '#2563eb' }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.hint}>
            {status === 'active' ? 'Property is visible to viewers' : 'Property is hidden'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isEditMode ? '💾 Update' : '➕ Create'}</Text>
          </TouchableOpacity>

          {isEditMode && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ Delete Property</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  scroll: { padding: 20 },
  modalHeader: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  inputError: { borderColor: '#ef4444' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  uploadButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  uploadButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  imagePreviewContainer: { marginTop: 12 },
  imagePreview: { position: 'relative', width: 120, height: 120, marginRight: 12 },
  previewImage: { width: '100%', height: '100%', borderRadius: 8 },
  thumbnailBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(37, 99, 235, 0.9)', paddingVertical: 4, paddingHorizontal: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  thumbnailBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: '#ef4444', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  removeImageText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  actions: { marginTop: 24, gap: 12 },
  saveButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: '600' },
  thumbnailInstructions: { fontSize: 13, color: '#2563eb', marginTop: 8, marginBottom: 4, fontWeight: '500' },
});
