import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ReportIncident1 = () => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required.');
      }
    })();
  }, []);

  const pickImage = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  } catch (error) {
    console.error('Camera error:', error);
    Alert.alert('Error', 'Could not open the camera.');
  }
};

  const proceed = () => {
    if (!imageUri) {
      Alert.alert('Upload Required', 'Please upload at least one image.');
      return;
    }

    // Proceed to next screen with imageUri passed via navigation
    navigation.navigate('ReportIncident2', { imageUri });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 1: Upload Scene Photo 📸</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <>
            <Icon name="camera-outline" size={40} color="#94A3B8" />
            <Text style={styles.uploadText}>Tap to take/upload a photo</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={proceed}>
        <Text style={styles.buttonText}>Continue to Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReportIncident1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 25,
  },
  uploadBox: {
    height: 250,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginBottom: 30,
  },
  uploadText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 10,
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
