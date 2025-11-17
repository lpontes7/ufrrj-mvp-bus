// src/screens/BusOverviewScreen.tsx
import {
  BusLocationService,
  BusSighting,
} from "@/src/services/bus-location.service";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app-navigator";
import { styles } from "./styles";
import { formatRelativeTime, formatTime } from "./utils";
import ImageViewer from "react-native-image-zoom-viewer";

type Props = NativeStackScreenProps<RootStackParamList, "BusOverview">;

export function BusOverviewScreen({ navigation, route }: Props) {
  const { userId, busId } = route.params;

  const [sightings, setSightings] = useState<BusSighting[]>([]);
  const [isLoadingSightings, setIsLoadingSightings] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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
      console.log("Erro ao buscar avistamentos:", error);
    } finally {
      setIsLoadingSightings(false);
    }
  };

  useEffect(() => {
    loadSightings();
  }, []);

  const handleOpenMap = () => {
    navigation.navigate("Maps", { userId, busId });
  };

  // imagem local para o ImageViewer
  const scheduleImages = [
    {
      url: "", // obrigatório, mas vazio pq usamos imagem local
      props: {
        source: require("../../../assets/images/bus-time.jpg"),
      },
    },
  ];

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View style={styles.container}>
          <Text style={styles.title}>Informações do ônibus</Text>
          <Text style={styles.subtitle}>Linha: {busId}</Text>

          {/* Grade de horários - botão que abre o zoom */}
          <View style={styles.card}>
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
              <Text style={styles.emptyText}>
                Nenhum avistamento recente registrado.
              </Text>
            )}

            {!isLoadingSightings && sightings.length > 0 && (
              <FlatList
                data={sightings}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const createdAtDate = new Date(item.createdAt);
                  return (
                    <View style={styles.sightingRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sightingTime}>
                          {formatTime(createdAtDate)} (
                          {formatRelativeTime(item.createdAt)})
                        </Text>
                        <Text style={styles.sightingCoords}>
                          Lat: {item.lat.toFixed(5)} | Lng:{" "}
                          {item.lng.toFixed(5)}
                        </Text>
                      </View>
                    </View>
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
            backgroundColor="#ffffff"          // fundo interno do viewer
            style={{ backgroundColor: "#fff" }} // garante o style da View interna  
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
