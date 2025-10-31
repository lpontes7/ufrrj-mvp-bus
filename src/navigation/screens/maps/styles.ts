import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1021" },
  topBar: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 40, default: 24 }),
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  title: { color: "#fff", fontWeight: "700", textAlign: "center" },

  statusBox: {
    position: "absolute",
    bottom: 110,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(11,16,33,0.8)",
    alignItems: "center",
  },
  statusText: { color: "#e8eaed", marginTop: 6 },

  centerBtn: {
    position: "absolute",
    bottom: 40,
    right: 16,
    backgroundColor: "#6e56cf",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 3,
  },
  centerBtnText: { color: "#fff", fontWeight: "700" },
});
