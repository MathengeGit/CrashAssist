import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import api from "../src/services/api"; // Make sure the path is correct

export default function Page() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/ping")
      .then((res) => {
        console.log("API response:", res.data);
        // Defensive check in case the response isn't a JSON object
        if (res.data && typeof res.data === "object" && res.data.message) {
          setMessage(res.data.message);
        } else {
          setError("Unexpected response format");
        }
      })
      .catch((err) => {
        console.error("API ERROR:", err.message);
        setError("Failed to connect: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text style={styles.text}>
          {error ? `❌ ${error}` : `✅ ${message}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  text: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});
