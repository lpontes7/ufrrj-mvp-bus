import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  bgImage: {
    position: "absolute",
    width: 180,
    height: 180,
    top: 0,
    left: 100,
    right: 0,
    alignSelf: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 80, android: 60, default: 40 }),
    paddingBottom: 24,
    justifyContent: "center",
  },

  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#555",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },

  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#555",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    color: "#000000ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff6b6b",
  },

  passwordRow: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 90,
  },
  eyeButton: {
    position: "absolute",
    right: 8,
    top: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  eyeText: {
    color: "#006A4E",
    fontWeight: "600",
  },

  forgotLink: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotText: {
    color: "#006A4E",
    fontWeight: "600",
    fontSize: 13,
  },

  primaryButton: {
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#006A4E",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#777",
    fontSize: 13,
  },

  secondaryButton: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#006A4E",
    marginTop: 8,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    color: "#006A4E",
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  signupText: {
    color: "#777",
    fontSize: 14,
  },
  signupLink: {
    color: "#006A4E",
    fontWeight: "700",
    marginLeft: 4,
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
  },

  version: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    color: "#777",
    fontSize: 12,
  },
});
