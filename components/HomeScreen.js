import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons'; // npm install react-native-vector-icons

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const currentYear = new Date().getFullYear();
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(currentYear);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fonction fetch refactorisée pour réutilisation
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        ` https://9a1123bcdc46.ngrok-free.app/commandes/stats/journalier?mois=${mois}&annee=${annee}`
      );

      const nbJours = new Date(annee, mois, 0).getDate();
      const joursDuMois = Array.from({ length: nbJours }, (_, i) => (i + 1).toString());

      const totauxParJour = {};
      response.data.forEach(item => {
        const jour = new Date(item.jour).getDate();
        totauxParJour[jour] = Number(item.total);
      });

      const quantitesCompletes = joursDuMois.map((jourStr) => {
        const jourNum = Number(jourStr);
        const total = totauxParJour[jourNum];
        return isNaN(total) || !isFinite(total) ? 0 : total;
      });

      const labelsReduits = joursDuMois.map((jour, index) =>
        index % 3 === 0 ? jour : ''
      );

      setLabels(labelsReduits);
      setData(quantitesCompletes);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setLabels([]);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [mois, annee]);

  // Chargement initial et quand mois/année changent
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <View style={styles.container}>
      {/* Header fixe avec bouton refresh */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo-modified.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Bluestrek</Text>
        <TouchableOpacity
          onPress={fetchStats}
          style={styles.refreshButton}
          accessibilityLabel="Rafraîchir les données"
        >
          <Icon name="refresh" size={26} color="#2280B0" />
        </TouchableOpacity>
      </View>

      {/* Contenu scrollable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.subtitle}>
          Commandes par jour - {mois.toString().padStart(2, '0')}/{annee}
        </Text>

        <View style={styles.pickersRow}>
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Mois</Text>
            <Picker
              selectedValue={mois}
              onValueChange={(value) => setMois(Number(value))}
              style={styles.picker}
              dropdownIconColor="#2280B0"
            >
              {[...Array(12)].map((_, index) => (
                <Picker.Item
                  key={index + 1}
                  label={`Mois ${index + 1}`}
                  value={index + 1}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Année</Text>
            <Picker
              selectedValue={annee}
              onValueChange={(value) => setAnnee(Number(value))}
              style={styles.picker}
              dropdownIconColor="#2280B0"
            >
              {[...Array(5)].map((_, i) => {
                const year = currentYear - i;
                return <Picker.Item key={year} label={`${year}`} value={year} />;
              })}
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2280B0"
            style={{ marginTop: 40 }}
          />
        ) : data.length === 0 ? (
          <Text style={styles.emptyText}>Aucune commande pour ce mois.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <BarChart
              key={`${mois}-${annee}`}
              data={{
                labels,
                datasets: [{ data }],
              }}
              width={Math.max(screenWidth, labels.length * 50)}
              height={280}
              fromZero
              showValuesOnTopOfBars={true}
              withInnerLines={false}
              withShadow={true}
              barRadius={8}
              chartConfig={{
                backgroundColor: '#f5f5f5',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: () => '#6b7a8f',
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#d1d9e6',
                },
                propsForLabels: {
                  fontWeight: '600',
                },
              }}
              style={{
                marginVertical: 12,
                borderRadius: 16,
                paddingRight: 10,
                shadowColor: '#2196f3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 5,
                backgroundColor: '#f5f5f5',
              }}
              verticalLabelRotation={-30}
            />
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d4ed8',
    letterSpacing: 1,
    flex: 1,
  },
  refreshButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '45%',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 1,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2280B0',
    marginLeft: 12,
    marginBottom: 4,
  },
  picker: {
    width: '100%',
    color: '#2280B0',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
