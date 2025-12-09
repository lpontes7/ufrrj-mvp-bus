// src/screens/maps/maps.screen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, Pressable, Image, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { MAX_SIGHTING_AGE_MS, RURAL_COORDS } from '@/src/utils/constants';
import { styles } from './styles';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../app-navigator';
import { BusLocationService } from '../../../services/bus-location.service';

import { formatRelativeTime, formatTime } from '@/src/utils/functions';
import { BusDirection, BusLiveShare, BusSighting } from '@/src/types/bus';

import * as Notifications from 'expo-notifications';

type FlowStep = 'initial' | 'mapSearching' | 'insideBus' | 'outsideBus';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Maps'>;

const toRad = (value: number) => (value * Math.PI) / 180;

const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371000; // raio da Terra em metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// RF10 – raio máximo de compartilhamento (5 km a partir do campus)
const MAX_SHARE_DISTANCE_METERS = 5000; // 5 km

const isWithinCampusRadius = (lat: number, lng: number): boolean => {
  const dist = getDistanceInMeters(
    lat,
    lng,
    RURAL_COORDS.latitude,
    RURAL_COORDS.longitude,
  );
  return dist <= MAX_SHARE_DISTANCE_METERS;
};

export default function MapScreen({ route, navigation }: MapScreenProps) {
  const { userId, busId, initialSighting } = route.params;

  const lastProximityNotificationRef = useRef<number | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>('initial');
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [showInitialModal, setShowInitialModal] = useState(true);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [liveShares, setLiveShares] = useState<BusLiveShare[]>([]);
  const [sightings, setSightings] = useState<BusSighting[]>([]);
  const [selectedSightingInfo, setSelectedSightingInfo] = useState<BusSighting | null>(
    null,
  );
  const [direction, setDirection] = useState<BusDirection | null>(null);
  const [showOutsideBanner, setShowOutsideBanner] = useState(false);

  // id do ônibus que estamos "seguindo"
  const [followLiveShareId, setFollowLiveShareId] = useState<string | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const sightingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const centerOnCampus = () => {
    if (!mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        ...RURAL_COORDS,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      800,
    );
  };

  const handleMarkerPress = (sighting: BusSighting) => {
    console.log('[MapScreen] marker pressed -> sighting', sighting);
    setSelectedSightingInfo(sighting);
    setFollowLiveShareId(null);
  };

  const centerOnUser = () => {
    if (!userLocation || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800,
    );
  };

  const handleStopInsideBus = async () => {
    console.log('[MapScreen] handleStopInsideBus');

    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    try {
      await BusLocationService.stopLiveShare({ busId, userId });
    } catch (err) {
      console.log('[MapScreen] erro ao parar liveShare:', err);
    }
    navigation.replace('BusOverview', {
      userId,
      busId,
    });
  };

  const getDirectionLabel = (dir: BusDirection | null | undefined) => {
    if (dir === 'TO_49') return '49';
    if (dir === 'TO_RURAL') return 'Rural';
    return 'Não informado';
  };

  const loadSightings = async () => {
    try {
      console.log('[MapScreen] loadSightings', { busId });
      const data = await BusLocationService.getLastSightings({
        busId,
        limit: 10,
      });

      const now = Date.now();
      const valid = data.filter((s) => !s.expiresAt || s.expiresAt > now);

      console.log('[MapScreen] loadSightings -> valid', valid.length);
      setSightings(valid);
    } catch (error) {
      console.log('Erro ao carregar avistamentos no mapa:', error);
    }
  };

useEffect(() => {
  console.log('[MapScreen] iniciando listener sightings', { busId });

  const isFirebaseTimestamp = (
    v: any,
  ): v is { seconds: number; nanoseconds?: number } => {
    return v && typeof v === 'object' && 'seconds' in v;
  };

  const unsubscribe = BusLocationService.listenToSightings(
    busId,
    (newSightings) => {
      console.log(
        '[MapScreen] sightings recebidos (raw):',
        JSON.stringify(newSightings, null, 2),
      );

      const now = Date.now();

      const validSightings = newSightings.filter((s) => {
        const rawCreatedAt = s.createdAt;
        let createdAtMs: number | null = null;

        try {
          if (typeof rawCreatedAt === 'number') {
            // timestamp em ms
            createdAtMs = rawCreatedAt;
          } else if (typeof rawCreatedAt === 'string') {
            // tenta número
            const parsedNum = Number(rawCreatedAt);
            if (!Number.isNaN(parsedNum)) {
              createdAtMs = parsedNum;
            } else {
              // tenta ISO string
              const parsedIso = Date.parse(rawCreatedAt);
              createdAtMs = Number.isNaN(parsedIso) ? null : parsedIso;
            }
          } else if (rawCreatedAt instanceof Date) {
            createdAtMs = rawCreatedAt.getTime();
          } else if (isFirebaseTimestamp(rawCreatedAt)) {
            createdAtMs = rawCreatedAt.seconds * 1000;
          }
        } catch (e) {
          console.log(
            '[MapScreen] erro ao interpretar createdAt em listener:',
            e,
          );
          createdAtMs = null;
        }

        if (!createdAtMs || !Number.isFinite(createdAtMs)) {
          console.log(
            '[MapScreen] descartando avistamento: createdAt inválido',
            rawCreatedAt,
          );
          return false;
        }

        const diff = now - createdAtMs;

        if (diff > MAX_SIGHTING_AGE_MS) {
          console.log(
            '[MapScreen] descartando avistamento (velho de mais): diffMs=',
            diff,
          );
          return false;
        }

        return true;
      });

      console.log(
        '[MapScreen] sightings válidos (<=10 min):',
        validSightings.length,
      );

      setSightings(validSightings);
    },
  );

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [busId]);


  // localização do usuário para cálculo de distância
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('[MapScreen] permissão localização negada (viewer)');
          return;
        }
        const current = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: current.coords.latitude,
          lng: current.coords.longitude,
        });
      } catch (err) {
        console.log('[MapScreen] erro ao obter localização inicial:', err);
      }
    })();
  }, []);

  useEffect(() => {
    console.log('[MapScreen] iniciando listener liveShares', { busId });

    const unsubscribe = BusLocationService.listenToLiveShares(busId, (shares) => {
      console.log('[MapScreen] liveShares atualizados:', shares.length);
      setLiveShares(shares);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [busId]);

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (sightingTimeoutRef.current) {
        clearTimeout(sightingTimeoutRef.current);
      }
    };
  }, []);

  // notificação por proximidade (com app aberto)
  useEffect(() => {
    if (!userLocation || liveShares.length === 0) return;

    // calcula a menor distância entre o usuário e os compartilhamentos
    let minDist = Infinity;

    for (const share of liveShares) {
      const dist = getDistanceInMeters(
        userLocation.lat,
        userLocation.lng,
        share.lat,
        share.lng,
      );

      if (dist < minDist) {
        minDist = dist;
      }
    }

    if (!Number.isFinite(minDist)) return;

    // evita notificar o tempo todo: só notifica a cada 5 minutos
    const now = Date.now();
    const last = lastProximityNotificationRef.current;
    const fiveMinutes = 5 * 60 * 1000;

    if (minDist < 1000 && (!last || now - last > fiveMinutes)) {
      lastProximityNotificationRef.current = now;

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ônibus próximo!',
          body: `Ele está a apenas ${minDist.toFixed(0)}m de você.`,
        },
        trigger: null, // dispara imediatamente
      });
    }
  }, [liveShares, userLocation]);

  // se veio de um avistamento da tela de overview
  useEffect(() => {
    if (initialSighting) {
      console.log('[MapScreen] inicial com avistamento', initialSighting);
      setShowInitialModal(false);
      setFlowStep('mapSearching');

      const regionFromSighting: Region = {
        latitude: initialSighting.lat,
        longitude: initialSighting.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setSelectedPoint({
        lat: initialSighting.lat,
        lng: initialSighting.lng,
      });

      // centraliza no ponto
      setTimeout(() => {
        mapRef.current?.animateToRegion(regionFromSighting, 800);
      }, 0);
    } else {
      setFlowStep('initial');
    }
  }, [initialSighting]);

  const sendInsideBusLocationToFirebase = (lat: number, lng: number) => {
    return BusLocationService.sendInsideBusLocation({
      busId,
      userId,
      lat,
      lng,
    });
  };

  const sendOutsideBusSightToFirebase = (
    lat: number,
    lng: number,
    direction: BusDirection,
  ) => {
    return BusLocationService.sendOutsideBusSight({
      busId,
      userId,
      lat,
      lng,
      direction,
    });
  };

  const handleSearchingBus = () => {
    console.log('[MapScreen] handleSearchingBus');
    setFlowStep('mapSearching');
    setShowInitialModal(false);
    setSelectedPoint(null);
    setDirection(null);
    setShowOutsideBanner(false);
    setSelectedSightingInfo(null);
    setFollowLiveShareId(null);

    mapRef.current?.animateToRegion(
      {
        ...RURAL_COORDS,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      800,
    );
  };

const handleInsideBus = async () => {
  console.log('[MapScreen] handleInsideBus');
  setShowInitialModal(false);
  setFlowStep('insideBus');
  setSelectedSightingInfo(null);
  setFollowLiveShareId(null);

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('[MapScreen] permissão localização:', status);

    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
      setFlowStep('mapSearching');
      return;
    }

    // 🔹 pega a posição atual (mais precisa)
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    console.log('[MapScreen] posição inicial dentro do ônibus:', current);

    const { latitude, longitude } = current.coords;

    // RF10 – valida se está dentro de 5 km do campus
    if (!isWithinCampusRadius(latitude, longitude)) {
      Alert.alert(
        'Fora da área permitida',
        'O compartilhamento de localização só é permitido em um raio de 5 km do campus da UFRRJ (Seropédica).',
      );
      setFlowStep('mapSearching');
      centerOnCampus();
      return;
    }

    const initialRegion: Region = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setUserLocation({
      lat: latitude,
      lng: longitude,
    });

    mapRef.current?.animateToRegion(initialRegion, 800);

    // ⬇️⬇️⬇️ **ENVIO IMEDIATO DA PRIMEIRA LOCALIZAÇÃO**
    try {
      console.log('[MapScreen] envio inicial de localização (inside bus)');
      await sendInsideBusLocationToFirebase(latitude, longitude);
    } catch (err) {
      console.log('[MapScreen] erro ao enviar localização inicial:', err);
      Alert.alert(
        'Erro',
        'Não foi possível iniciar o compartilhamento de localização. Tente novamente.',
      );
      setFlowStep('mapSearching');
      return;
    }

    // ⬇️ watcher contínuo depois do envio inicial
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;

        console.log('[MapScreen] watchPositionAsync update:', {
          latitude,
          longitude,
        });

        // RF10 – se saiu da área permitida, interrompe compartilhamento
        if (!isWithinCampusRadius(latitude, longitude)) {
          console.log('[MapScreen] usuário saiu da área de 5 km, parando liveShare');

          if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
          }

          BusLocationService.stopLiveShare({ busId, userId }).catch((err) =>
            console.log('[MapScreen] erro ao parar liveShare após sair da área:', err),
          );

          Alert.alert(
            'Compartilhamento interrompido',
            'Você saiu da área de 5 km do campus. O compartilhamento em tempo real foi encerrado.',
          );

          setFlowStep('mapSearching');
          centerOnCampus();
          return;
        }

        setUserLocation({ lat: latitude, lng: longitude });

        sendInsideBusLocationToFirebase(latitude, longitude).catch((err) =>
          console.log('[MapScreen] erro ao enviar localização (watch):', err),
        );

        mapRef.current?.animateCamera({
          center: { latitude, longitude },
        });
      },
    );
  } catch (err) {
    console.log('[MapScreen] erro genérico no handleInsideBus:', err);
    Alert.alert(
      'Erro',
      'Não foi possível iniciar o compartilhamento de localização. Tente novamente.',
    );
    setFlowStep('mapSearching');
  }
};

  const handleOutsideBus = () => {
    console.log('[MapScreen] handleOutsideBus');
    setShowInitialModal(false);
    setFlowStep('outsideBus');
    setSelectedPoint(null);
    setDirection(null);
    setShowOutsideBanner(true);
    setSelectedSightingInfo(null);
    setFollowLiveShareId(null);

    // 👉 ao entrar no fluxo "fora do ônibus", centraliza no campus
    centerOnCampus();

    if (sightingTimeoutRef.current) {
      clearTimeout(sightingTimeoutRef.current);
      sightingTimeoutRef.current = null;
    }
  };

const handleMapPress = (event: MapPressEvent) => {
  setSelectedSightingInfo(null);
  setFollowLiveShareId(null);

  if (flowStep !== 'outsideBus') return;

  const { latitude, longitude } = event.nativeEvent.coordinate;

  console.log('[MapScreen] handleMapPress outsideBus:', {
    latitude,
    longitude,
  });

  // 🚫 RF10 – não permite nem marcar ponto fora do raio
  if (!isWithinCampusRadius(latitude, longitude)) {
    Alert.alert(
      'Fora da área permitida',
      'Você só pode marcar avistamentos em um raio de 5 km do campus da UFRRJ (Seropédica).',
    );

    // opcional: volta o foco pro campus de novo
    centerOnCampus();
    return;
  }

  setSelectedPoint({ lat: latitude, lng: longitude });
  setDirection(null);
  setShowOutsideBanner(true);
};


  const handleConfirmOutsideBusLocation = async () => {
    if (!selectedPoint) return;
    const { lat, lng } = selectedPoint;
    // RF10 – valida se o ponto marcado está dentro de 5 km do campus
    if (!isWithinCampusRadius(lat, lng)) {
      Alert.alert(
        'Fora da área permitida',
        'O compartilhamento de localização só é permitido em um raio de 5 km do campus da UFRRJ (Seropédica).',
      );
      centerOnCampus();
      return;
    }
    
    if (!direction) {
      Alert.alert(
        'Selecione o sentido',
        'Escolha se o ônibus está indo para a Rural ou para o 49.',
      );
      return;
    }


    try {
      console.log('[MapScreen] confirmOutsideBusLocation:', {
        lat,
        lng,
        direction,
      });

      await sendOutsideBusSightToFirebase(lat, lng, direction);

      setSelectedPoint(null);
      setDirection(null);
      setFlowStep('mapSearching');
      setShowOutsideBanner(false);
    } catch (error) {
      console.log('Erro ao registrar avistamento:', error);
      Alert.alert('Erro', 'Não foi possível registrar o avistamento. Tente novamente.');
    }
  };

  // seguir o ônibus selecionado em tempo real (sem depender de region)
  useEffect(() => {
    if (!followLiveShareId) return;
    const share = liveShares.find((s) => s.id === followLiveShareId);
    if (!share || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: share.lat,
        longitude: share.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  }, [followLiveShareId, liveShares]);

  // --------- helper seguro para horário do avistamento selecionado ---------
  // --------- helper seguro para horário do avistamento selecionado ---------
  const renderSelectedSightingInfo = () => {
    if (!selectedSightingInfo) return null;

    const rawCreatedAt = selectedSightingInfo.createdAt;

    let createdAtMs: number | null = null;

    try {
      if (typeof rawCreatedAt === 'number') {
        // já é timestamp em ms
        createdAtMs = rawCreatedAt;
      } else if (typeof rawCreatedAt === 'string') {
        const parsed = Number(rawCreatedAt);
        createdAtMs = Number.isNaN(parsed) ? null : parsed;
      } else if (
        rawCreatedAt &&
        typeof rawCreatedAt === 'object' &&
        // suporte para Timestamp do Firestore, se for o caso
        'seconds' in rawCreatedAt
      ) {
        const anyTs = rawCreatedAt as { seconds: number; nanoseconds?: number };
        createdAtMs = anyTs.seconds * 1000;
      }
    } catch (e) {
      console.log('[MapScreen] erro ao interpretar createdAt do avistamento:', e);
      createdAtMs = null;
    }

    let horarioTexto = 'Não informado';

    if (createdAtMs && Number.isFinite(createdAtMs)) {
      try {
        const dateObj = new Date(createdAtMs);
        horarioTexto = `${formatTime(dateObj)} (${formatRelativeTime(createdAtMs)})`;
      } catch (e) {
        console.log('[MapScreen] erro ao formatar horário do avistamento:', e);
        horarioTexto = 'Não informado';
      }
    }

    return (
      <View
        style={{
          position: 'absolute',
          bottom: flowStep === 'outsideBus' && showOutsideBanner ? 120 : 16,
          left: 16,
          right: 16,
          backgroundColor: '#ffffff',
          padding: 12,
          borderRadius: 8,
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text
          style={{
            fontWeight: '600',
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          Avistamento selecionado
        </Text>

        <Text style={{ fontSize: 13 }}>Horário: {horarioTexto}</Text>

        <Text style={{ fontSize: 13, marginTop: 2 }}>
          Sentido: {getDirectionLabel(selectedSightingInfo.direction)}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          ...RURAL_COORDS,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsMyLocationButton={false}
        showsUserLocation={flowStep !== 'insideBus'}
        onPress={handleMapPress}
      >
        {/* Ícones em tempo real (vários usuários/ônibus) */}
        {liveShares.map((share) => {
          let distanceLabel: string | null = null;

          if (userLocation) {
            const dist = getDistanceInMeters(
              userLocation.lat,
              userLocation.lng,
              share.lat,
              share.lng,
            );
            distanceLabel = formatDistance(dist);
          }

          const isFollowing = followLiveShareId === share.id;

          return (
            <Marker
              key={share.id}
              coordinate={{
                latitude: share.lat,
                longitude: share.lng,
              }}
              title={isFollowing ? 'Seguindo este ônibus' : 'Ônibus em tempo real'}
              description={
                distanceLabel
                  ? `A ${distanceLabel} de você · Atualizado há ${formatRelativeTime(
                      share.updatedAt,
                    )}`
                  : `Atualizado há ${formatRelativeTime(share.updatedAt)}`
              }
              onPress={() => {
                setSelectedSightingInfo(null);
                setFollowLiveShareId((prev) => (prev === share.id ? null : share.id));
              }}
            >
              <Image
                source={require('../../../assets/icons/little-bus-logo.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          );
        })}

        {/* Avistamentos fixos */}
        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            coordinate={{
              latitude: sighting.lat,
              longitude: sighting.lng,
            }}
            title="Ônibus visto aqui"
            onPress={() => handleMarkerPress(sighting)}
          >
            <Image
              source={require('../../../assets/icons/bus-market.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {/* Ponto marcado antes de confirmar (modo fora do ônibus / ou initialSighting) */}
        {selectedPoint && flowStep === 'outsideBus' && (
          <Marker
            coordinate={{
              latitude: selectedPoint.lat,
              longitude: selectedPoint.lng,
            }}
            title="Ônibus visto aqui"
          >
            <Image
              source={require('../../../assets/icons/bus-market.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>

      {/* 📍 Botão flutuante para centralizar no usuário */}
      <Pressable style={styles.centerButton} onPress={centerOnUser}>
        <Text style={styles.centerButtonText}>📍</Text>
      </Pressable>

      {flowStep === 'insideBus' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Compartilhando sua localização (dentro do ônibus)
          </Text>

          <Pressable style={styles.stopShareButton} onPress={handleStopInsideBus}>
            <Text style={styles.stopShareButtonText}>Parar de compartilhar</Text>
          </Pressable>
        </View>
      )}

      {flowStep === 'outsideBus' && showOutsideBanner && (
        <View style={styles.banner}>
          {selectedPoint ? (
            <>
              <Text style={styles.bannerText}>
                Confirme o local e o sentido em que o ônibus está.
              </Text>

              <View style={styles.directionRow}>
                <Text style={styles.directionLabel}>Sentido:</Text>

                <Pressable
                  style={[
                    styles.directionChip,
                    direction === 'TO_RURAL' && styles.directionChipActive,
                  ]}
                  onPress={() => setDirection('TO_RURAL')}
                >
                  <Text
                    style={[
                      styles.directionChipText,
                      direction === 'TO_RURAL' && styles.directionChipTextActive,
                    ]}
                  >
                    Rural
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.directionChip,
                    direction === 'TO_49' && styles.directionChipActive,
                  ]}
                  onPress={() => setDirection('TO_49')}
                >
                  <Text
                    style={[
                      styles.directionChipText,
                      direction === 'TO_49' && styles.directionChipTextActive,
                    ]}
                  >
                    49
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.button, { marginTop: 8, opacity: direction ? 1 : 0.5 }]}
                onPress={handleConfirmOutsideBusLocation}
              >
                <Text style={styles.buttonText}>Confirmar localização</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.bannerText}>
              Toque no mapa para marcar onde você viu o ônibus
            </Text>
          )}
        </View>
      )}

      {renderSelectedSightingInfo()}

      <Modal visible={showInitialModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Como você quer usar o mapa agora?</Text>

            {/* 1) Estou dentro do ônibus – VERDE */}
            <Pressable style={styles.button} onPress={handleInsideBus}>
              <Text style={styles.buttonText}>Estou dentro do ônibus</Text>
            </Pressable>

            {/* 2) Vi o ônibus e quero marcar – VERDE */}
            <Pressable style={styles.button} onPress={handleOutsideBus}>
              <Text style={styles.buttonText}>Vi o ônibus e quero marcar</Text>
            </Pressable>

            {/* 3) Estou procurando o ônibus – BRANCO (secundário) */}
            <Pressable style={styles.buttonSecondary} onPress={handleSearchingBus}>
              <Text style={styles.buttonSecondaryText}>Estou procurando o ônibus</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
