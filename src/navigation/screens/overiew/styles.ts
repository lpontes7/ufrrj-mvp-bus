// src/screens/bus-overview.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshText: {
    color: '#006A4E',
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scheduleTime: {
    width: 60,
    fontWeight: '600',
  },
  scheduleDescription: {
    flex: 1,
    fontSize: 14,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
  },
  sightingRow: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  sightingTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  sightingCoords: {
    fontSize: 12,
    color: '#555',
  },
  mapButton: {
    marginTop: 8,
    backgroundColor: '#006A4E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  scheduleButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006A4E', // ou usa seu tema de cores
  },

  scheduleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  scheduleHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  scheduleModalBox: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 12,
    overflow: 'hidden',
  },

  scheduleImage: {
    width: '100%',
    height: 450,
  },

  closeButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#006A4E',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },

  zoomModalRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  closeButtonOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#006A4E',
  },

  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  sightingDirection: {
    fontSize: 12,
    color: '#006A4E',
    marginTop: 2,
    fontWeight: '500',
  },

  sightingHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  liveStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 0,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  liveStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 2,
  },

  liveStatusDotOn: {
    backgroundColor: '#16a34a', // verde
    borderColor: '#16a34a',
  },

  liveStatusDotOff: {
    backgroundColor: '#ffffff', // "branca"
    borderColor: '#d1d5db',
  },

  liveStatusText: {
    fontSize: 13,
    color: '#4b5563',
  },
});
