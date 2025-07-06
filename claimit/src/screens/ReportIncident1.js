import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReportIncident1 = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required.');
      }
    })();
  }, []);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only upload up to 3 images.');
      return;
    }

    Alert.alert(
      'Choose Image Source',
      'Pick a photo from:',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled && result.assets?.length > 0) {
              setImages(prev => [...prev, result.assets[0]]);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled && result.assets?.length > 0) {
              setImages(prev => [...prev, result.assets[0]]);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const uploadImagesToServer = async () => {
    const formData = new FormData();

    images.forEach((image, index) => {
      formData.append('photos', {
        uri: image.uri,
        name: `photo_${index + 1}.jpg`,
        type: 'image/jpeg',
      });
    });

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Authentication Error', 'You are not logged in.');
        return;
      }

      const response = await axios.post(
        'https://claimit-backend-q4jj.onrender.com/api/claims/uploadPhotos',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.uploadedPhotoUrls;
    } catch (error) {
      console.error('Upload error:', error.message);
      Alert.alert('Upload Failed', 'Failed to upload images. Please try again.');
      return null;
    }
  };

  const proceed = async () => {
    if (images.length === 0) {
      Alert.alert('Upload Required', 'Please upload at least one image.');
      return;
    }

    setUploading(true);
    const uploadedPhotoUrls = await uploadImagesToServer();
    setUploading(false);

    if (uploadedPhotoUrls) {
      navigation.navigate('ReportIncident2', { photoUrls: uploadedPhotoUrls });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.progressText}>Step 1 of 4</Text>
      <Text style={styles.title}>Upload Scene Photos 📸</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        <Icon name="camera-outline" size={40} color="#94A3B8" />
        <Text style={styles.uploadText}>Tap to take/upload a photo ({images.length}/3)</Text>
      </TouchableOpacity>

      <View style={styles.imageGrid}>
        {images.map((img, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: img.uri }} style={styles.imageThumb} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const newImages = [...images];
                newImages.splice(index, 1);
                setImages(newImages);
              }}
            >
              <Icon name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={proceed} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue to Location</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 25,
  },
  uploadBox: {
    height: 200,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginBottom: 20,
  },
  uploadText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  imageWrapper: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportIncident1;
