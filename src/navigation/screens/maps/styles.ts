// src/screens/styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  bannerText: {
    color: "#fff",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#006A4E", // verde Rural
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#006A4E",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonSecondaryText: {
    color: "#006A4E",
    textAlign: "center",
    fontWeight: "600",
  },
});
