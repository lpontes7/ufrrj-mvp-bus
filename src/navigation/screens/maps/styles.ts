// src/screens/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bannerText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#006A4E', // verde Rural
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#006A4E',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonSecondaryText: {
    color: '#006A4E',
    textAlign: 'center',
    fontWeight: '600',
  },

  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  directionLabel: {
    color: '#fff',
    marginRight: 8,
    fontWeight: '500',
  },

  directionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 8,
  },

  directionChipActive: {
    backgroundColor: '#fff',
  },

  directionChipText: {
    color: '#fff',
    fontWeight: '600',
  },

  directionChipTextActive: {
    color: '#0f172a',
  },

  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  stopShareButton: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'center',
  },

  stopShareButtonText: {
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'center',
  },

  centerButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)', // igual ao botão Voltar
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999, // completamente arredondado
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
