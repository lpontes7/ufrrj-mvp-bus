import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet,  Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { BusLocation } from '../../../types/bus';
import { styles } from './styles';
import { formatSubtitle } from './utils';
import { useBusLocations } from '../../../hooks/useBusLocations';


const INITIAL_REGION = {
  latitude: -22.756,    
  longitude: -43.691,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export default function MapScreen() {
  const { buses, isLoading, error } = useBusLocations() as {
    buses: BusLocation[]; isLoading: boolean; error?: string | null;
  };
  const [userRegion, setUserRegion] = useState(INITIALREGION_FALLBACK());

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      } catch {
        // mantém fallback
      }
    })();
  }, []);

  const region = useMemo(() => {
    // se quiser sempre focar no usuário
    return userRegion;
  }, [userRegion]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        region={region}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled
      >
        {(buses ?? []).map((b) => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.lat, longitude: b.lng }}
            title={b.line || `Ônibus ${b.id}`}
            description={formatSubtitle(b)}
            // Se tiver ícone do bus: image={require('../../assets/icons/bus.png')}
            // rotation={b.headingDeg ?? 0} // se quiser girar o ícone
          />
        ))}
      </MapView>

      <View style={styles.topBar}>
        <Text style={styles.title}>Ônibus UFRRJ — Tempo real</Text>
      </View>

      {(isLoading || error) && (
        <View style={styles.statusBox}>
          {isLoading ? (
            <>
              <ActivityIndicator />
              <Text style={styles.statusText}>Carregando posições…</Text>
            </>
          ) : (
            <Text style={styles.statusText}>Erro: {error}</Text>
          )}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.centerBtn, pressed && { opacity: 0.9 }]}
        onPress={recenterToUser(setUserRegion)}
      >
        <Text style={styles.centerBtnText}>Centralizar</Text>
      </Pressable>
    </View>
  );
}


function recenterToUser(setUserRegion: React.Dispatch<any>) {
  return async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch {}
  };
}

function INITIALREGION_FALLBACK() {
  return { ...INITIAL_REGION };
}

