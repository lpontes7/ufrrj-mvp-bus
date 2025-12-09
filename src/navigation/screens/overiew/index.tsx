// src/screens/BusOverviewScreen.tsx
import { BusLocationService } from '@/src/services/bus-location.service';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../app-navigator';
import { styles } from './styles';

import ImageViewer from 'react-native-image-zoom-viewer';
import { formatRelativeTime, formatTime, normalizeCreatedAt } from '@/src/utils/functions';
import { BusSighting, BusLiveShare } from '@/src/types/bus';

type Props = NativeStackScreenProps<RootStackParamList, 'BusOverview'>;

export function BusOverviewScreen({ navigation, route }: Props) {
  const { userId, busId } = route.params;

  const [sightings, setSightings] = useState<BusSighting[]>([]);
  const [isLoadingSightings, setIsLoadingSightings] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [liveShares, setLiveShares] = useState<BusLiveShare[]>([]);

  const liveSharesCount = liveShares.length;

  const loadSightings = async () => {
    try {
      setIsLoadingSightings(true);
      const data = await BusLocationService.getLastSightings({
        busId,
        limit: 5,
      });

      const now = Date.now();
      const valid = data.filter((s) => !s.expiresAt || s.expiresAt > now);

      setSightings(valid);
    } catch (error) {
      console.log('Erro ao buscar avistamentos:', error);
    } finally {
      setIsLoadingSightings(false);
    }
  };

  useEffect(() => {
    loadSightings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSightings();
    }, []),
  );

  // 👇 listener dos compartilhamentos em tempo real
  useEffect(() => {
    const unsubscribe = BusLocationService.listenToLiveShares(busId, (shares) => {
      setLiveShares(shares);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [busId]);

  // 👇 listener dos avistamentos em tempo real
  useEffect(() => {
    const unsubscribe = BusLocationService.listenToSightings(
      busId,
      (newSightings) => {
        const now = Date.now();

        // reaplica a mesma regra de expiração baseada em expiresAt
        const valid = newSightings.filter(
          (s) => !s.expiresAt || s.expiresAt > now,
        );

        // garante no máximo 5 itens na lista
        const limited = valid.slice(0, 5);

        setSightings(limited);
      },
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [busId]);

  const handleOpenMap = () => {
    navigation.navigate('Maps', { userId, busId });
  };

  // quando clicar no card de status em tempo real
  const handlePressLiveStatus = () => {
    if (liveSharesCount >= 1) {
      // pega o mais recente pelo updatedAt
      const latestShare = liveShares.reduce((latest, current) =>
        current.updatedAt > latest.updatedAt ? current : latest,
      );

      navigation.navigate('Maps', {
        userId,
        busId,
        initialSighting: {
          lat: latestShare.lat,
          lng: latestShare.lng,
          createdAt: latestShare.updatedAt,
          direction: null,
        },
      });
    }
  };

  const scheduleImages = [
    {
      url: '',
      props: {
        source: require('../../../assets/images/bus-time.png'),
      },
    },
  ];

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={styles.container}>
          {/* Grade de horários - botão que abre o zoom */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Grade de horários</Text>

            <Pressable
              style={styles.scheduleButton}
              onPress={() => setShowScheduleModal(true)}
            >
              <Text style={styles.scheduleButtonText}>Ver grade completa</Text>
            </Pressable>

            <Text style={styles.scheduleHint}>
              Toque para abrir a imagem com os horários do ônibus.
            </Text>
          </View>

          {/* Status de compartilhamento em tempo real */}
          <Pressable
            style={[
              styles.liveStatusCard,
              liveSharesCount > 1 ? null : { opacity: 0.9 },
            ]}
            onPress={handlePressLiveStatus}
          >
            <View
              style={[
                styles.liveStatusDot,
                liveSharesCount > 0 ? styles.liveStatusDotOn : styles.liveStatusDotOff,
              ]}
            />
            <Text style={styles.liveStatusText}>
              {liveSharesCount > 0
                ? liveSharesCount === 1
                  ? '1 ônibus compartilhando a localização em tempo real'
                  : `${liveSharesCount} ônibus compartilhando a localização em tempo real`
                : 'Nenhum ônibus está compartilhando a localização agora'}
            </Text>
          </Pressable>

          {/* Últimos avistamentos */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Últimos avistamentos</Text>
              <Pressable onPress={loadSightings}>
                <Text style={styles.refreshText}>Atualizar</Text>
              </Pressable>
            </View>

            {isLoadingSightings && (
              <View style={styles.centerRow}>
                <ActivityIndicator />
                <Text style={{ marginLeft: 8 }}>Carregando...</Text>
              </View>
            )}

            {!isLoadingSightings && sightings.length === 0 && (
              <Text style={styles.emptyText}>Nenhum avistamento recente registrado.</Text>
            )}

            {!isLoadingSightings && sightings.length > 0 && (
              <FlatList
                data={sightings}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
          const createdAtDate = new Date(normalizeCreatedAt(item.createdAt));

                  const directionLabel =
                    item.direction === 'TO_49'
                      ? '49'
                      : item.direction === 'TO_RURAL'
                        ? 'Rural'
                        : 'Não informado';

                  return (
                    <Pressable
                      onPress={() =>
                        navigation.navigate('Maps', {
                          userId,
                          busId,
                          initialSighting: {
                            lat: item.lat,
                            lng: item.lng,
       createdAt: normalizeCreatedAt(item.createdAt),
                            direction: item.direction ?? null,
                          },
                        })
                      }
                      style={({ pressed }) => [
                        styles.sightingRow,
                        pressed && { backgroundColor: '#f0f9ff' },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sightingTime}>
                          {formatTime(createdAtDate)} (
               {formatRelativeTime(normalizeCreatedAt(item.createdAt))}
                        </Text>

                        <Text style={styles.sightingDirection}>
                          Sentido: {directionLabel}
                        </Text>

                        <Text style={styles.sightingHint}>
                          Toque para ver este ponto no mapa.
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          {/* Botão para abrir o mapa */}
          <Pressable style={styles.mapButton} onPress={handleOpenMap}>
            <Text style={styles.mapButtonText}>Ver mapa</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal com zoom na imagem da grade de horários */}
      <Modal
        visible={showScheduleModal}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.zoomModalRoot}>
          <ImageViewer
            imageUrls={scheduleImages}
            enableSwipeDown
            onSwipeDown={() => setShowScheduleModal(false)}
            saveToLocalByLongPress={false}
            backgroundColor="#ffffff"
            style={{ backgroundColor: '#fff' }}
          />

          <Pressable
            style={styles.closeButtonOverlay}
            onPress={() => setShowScheduleModal(false)}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
