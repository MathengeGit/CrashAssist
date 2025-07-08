import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

export default function GetStartedScreen() {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef(null);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Optional: Play a Lottie moment (e.g., play from frame 0 to 60)
    lottieRef.current?.play(0, 60);

    // Navigate after a short delay to allow Lottie effect
    setTimeout(() => {
      navigation.navigate('Signup');
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>
        Claim<Text style={styles.logoAccent}>It</Text>
      </Text>

      {/* Animation */}
      <LottieView
        ref={lottieRef}
        source={require('../../assets/animations/car-safety.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Pitch */}
      <Text style={styles.pitch}>
        File Claims Instantly. Get Help When It Matters Most.
      </Text>

      {/* Get Started Button */}
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleGetStarted}
      >
        <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
          <Icon name="arrow-right-circle" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Get Started</Text>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Login Link */}
      <TouchableWithoutFeedback onPress={() => navigation.navigate('Login')}>
        <View>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  logoAccent: {
    color: '#0a66c2',
  },
  animation: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
  pitch: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#0a66c2',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  loginLink: {
    marginTop: 20,
    color: '#0a66c2',
    textDecorationLine: 'underline',
  },
});
