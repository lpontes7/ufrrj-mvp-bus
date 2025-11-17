// src/screens/maps/maps.screen.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Modal, Pressable, Image } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";

import { RURAL_COORDS } from "@/src/utils/constants";
import { styles } from "./styles";
import { BusLocationService } from "../../../services/bus-location.service";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app-navigator";

type FlowStep =
  | "initial"      // primeira pergunta
  | "sawBus"       // segunda pergunta (dentro/fora)
  | "mapSearching" // estou procurando
  | "insideBus"    // compartilhando localização
  | "outsideBus";  // marcando ponto no mapa

type MapScreenProps = NativeStackScreenProps<RootStackParamList, "Maps">;

export default function MapScreen({ route }: MapScreenProps) {
  const { userId, busId } = route.params;

  const [flowStep, setFlowStep] = useState<FlowStep>("initial");
  const [region, setRegion] = useState<Region>(RURAL_COORDS);
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showInitialModal, setShowInitialModal] = useState(true);
  const [showSawBusModal, setShowSawBusModal] = useState(false);

  // posição do usuário quando estiver dentro do ônibus
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // timeout para remover o marcador de "visto fora" após 5 minutos
  const sightingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpa o watch da localização e timeouts ao sair da tela
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

  // --------- Firebase helpers ---------
  const sendInsideBusLocationToFirebase = (lat: number, lng: number) => {
    return BusLocationService.sendInsideBusLocation({
      busId,
      userId,
      lat,
      lng,
    });
  };

  const sendOutsideBusSightToFirebase = (lat: number, lng: number) => {
    return BusLocationService.sendOutsideBusSight({
      busId,
      userId,
      lat,
      lng,
    });
  };

  // --------- Fluxo dos modais ---------
  const handleSearchingBus = () => {
    // "Estou procurando o ônibus"
    setFlowStep("mapSearching");
    setShowInitialModal(false);
    setShowSawBusModal(false);
    // Centraliza na Rural
    setRegion(RURAL_COORDS);
    mapRef.current?.animateToRegion(RURAL_COORDS, 800);
  };

  const handleSawBus = () => {
    // "Já vi o ônibus"
    setFlowStep("sawBus");
    setShowInitialModal(false);
    setShowSawBusModal(true);
  };

  const handleInsideBus = async () => {
    setShowSawBusModal(false);
    setFlowStep("insideBus");

    // Pede permissão
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      // ideal: mostrar um alerta para o usuário
      setFlowStep("mapSearching");
      return;
    }

    // Pega localização atual e centraliza
    const current = await Location.getCurrentPositionAsync({});
    const initialRegion: Region = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(initialRegion);
    setUserLocation({
      lat: current.coords.latitude,
      lng: current.coords.longitude,
    });

    // anima o mapa para a posição atual do usuário
    mapRef.current?.animateToRegion(initialRegion, 800);

    // Começa a compartilhar em tempo real
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5s
        distanceInterval: 10, // 10m
      },
      (location) => {
        const { latitude, longitude } = location.coords;

        // Atualiza a posição do usuário no estado
        setUserLocation({ lat: latitude, lng: longitude });

        // Envia para o Firebase
        sendInsideBusLocationToFirebase(latitude, longitude);

        // Mantém o mapa focado no usuário
        mapRef.current?.animateCamera({
          center: { latitude, longitude },
        });
      }
    );
  };

  const handleOutsideBus = () => {
    setShowSawBusModal(false);
    setFlowStep("outsideBus");
    // limpa qualquer seleção anterior
    setSelectedPoint(null);
    if (sightingTimeoutRef.current) {
      clearTimeout(sightingTimeoutRef.current);
      sightingTimeoutRef.current = null;
    }
  };

  // --------- Clique no mapa quando está "fora do ônibus" ---------
  const handleMapPress = (event: MapPressEvent) => {
    if (flowStep !== "outsideBus") return;

    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Apenas seleciona o ponto visualmente
    setSelectedPoint({ lat: latitude, lng: longitude });

    // Se quiser, pode centralizar no ponto marcado:
    // mapRef.current?.animateToRegion(
    //   {
    //     latitude,
    //     longitude,
    //     latitudeDelta: region.latitudeDelta,
    //     longitudeDelta: region.longitudeDelta,
    //   },
    //   500
    // );
  };

  // --------- Confirmação da localização "fora do ônibus" ---------
  const handleConfirmOutsideBusLocation = () => {
    if (!selectedPoint) return;

    const { lat, lng } = selectedPoint;

    // Envia pro Firebase com TTL de 5 minutos (expiresAt)
    sendOutsideBusSightToFirebase(lat, lng);

    // Se já tinha um timeout anterior, limpa
    if (sightingTimeoutRef.current) {
      clearTimeout(sightingTimeoutRef.current);
    }

    // Agenda para remover o marcador do mapa após 5 minutos
    sightingTimeoutRef.current = setTimeout(() => {
      setSelectedPoint(null);
    }, 5 * 60 * 1000); // 5 minutos
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        // Quando estiver dentro do ônibus, escondemos o ponto azul padrão
        showsUserLocation={flowStep !== "insideBus"}
      >
        {/* Ícone de ônibus na posição do usuário quando estiver dentro */}
        {flowStep === "insideBus" && userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
          >
            <Image
              // Ajusta o caminho do ícone conforme sua estrutura
              source={require("../../../assets/icons/bus-market.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        )}

        {/* Ponto marcado quando o usuário está fora e clica no mapa */}
        {selectedPoint && (
          <Marker
            coordinate={{
              latitude: selectedPoint.lat,
              longitude: selectedPoint.lng,
            }}
            title="Ônibus visto aqui"
          />
        )}
      </MapView>

      {/* Banner para indicar o modo atual */}
      {flowStep === "insideBus" && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Compartilhando sua localização (dentro do ônibus)</Text>
        </View>
      )}

      {flowStep === "outsideBus" && (
        <View style={styles.banner}>
          {selectedPoint ? (
            <>
              <Text style={styles.bannerText}>
                Confirmar o local onde você viu o ônibus?
              </Text>
              <Pressable
                style={[styles.button, { marginTop: 8 }]}
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

      {/* Modal 1: Você viu ou está procurando? */}
      <Modal visible={showInitialModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Você viu o ônibus ou está procurando o ônibus?
            </Text>

            <Pressable style={styles.button} onPress={handleSearchingBus}>
              <Text style={styles.buttonText}>Estou procurando</Text>
            </Pressable>

            <Pressable style={styles.buttonSecondary} onPress={handleSawBus}>
              <Text style={styles.buttonSecondaryText}>Já vi o ônibus</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Dentro ou fora? */}
      <Modal visible={showSawBusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Você está dentro do ônibus ou fora dele?</Text>

            <Pressable style={styles.button} onPress={handleInsideBus}>
              <Text style={styles.buttonText}>Estou dentro</Text>
            </Pressable>

            <Pressable style={styles.buttonSecondary} onPress={handleOutsideBus}>
              <Text style={styles.buttonSecondaryText}>Estou fora</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
