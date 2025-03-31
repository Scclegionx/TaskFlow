import React, { useState,useEffect } from 'react';
import { View, Text, Image, TouchableOpacity,StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
          navigation.setOptions({ 
              headerShown: false,
              title: "", 
              headerStyle: { backgroundColor: '#3A7BDD' }, 
              headerTintColor: '#fff' 
          });
      }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/welcome.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => router.push("/register")}>
        <Text style={[styles.buttonText, styles.registerText]}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

// Định nghĩa styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  image: {
    width: "80%",
    height: 300,
    marginBottom: 30,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2F80ED",
  },
  registerText: {
    color: "#2F80ED",
  },
});
