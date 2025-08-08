import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

const CommandesScreen = () => {
  // Fonction pour formater le stock en rouleaux + mètres (avec soustraction uniquement)
  function formatStock(quantiteStockFloat, longueurParRouleau) {
    if (!longueurParRouleau || longueurParRouleau <= 0) {
      return `${quantiteStockFloat} unités`;
    }

    let rouleaux = 0;
    let reste = quantiteStockFloat;

    while (reste >= 1) {
      rouleaux += 1;
      reste -= 1;
    }

    const metresRestants = Math.round(reste * longueurParRouleau);

    return `${rouleaux} rouleau(x) et ${metresRestants} m`;
  }

  const [tab, setTab] = useState('form');

  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);

  const [openClient, setOpenClient] = useState(false);
  const [openProduit, setOpenProduit] = useState(false);

  const [clientId, setClientId] = useState(null);
  const [produitRef, setProduitRef] = useState(null);
  const [quantite, setQuantite] = useState('');
  const [rouleaux, setRouleaux] = useState('');
  const [metres, setMetres] = useState('');
  const [rouleauxVirtuels, setRouleauxVirtuels] = useState(0);

  const [quantiteStock, setQuantiteStock] = useState(0);
  const [longueurParRouleau, setLongueurParRouleau] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    axios.get(' https://9a1123bcdc46.ngrok-free.app/api/clients')
      .then(res => {
        const formattedClients = res.data.map(c => ({ label: c.nom, value: c.id }));
        setClients(formattedClients);
      })
      .catch(err => console.error('Erreur chargement clients:', err));

    axios.get(' https://9a1123bcdc46.ngrok-free.app/api/produits')
      .then(res => {
        const formattedProduits = res.data.map(p => ({
          label: p.designation,
          value: p.reference,
          longueur_par_rouleau: p.longueur_par_rouleau ? Number(p.longueur_par_rouleau) : 0,
          quantite_stock: p.quantite_stock ? Number(p.quantite_stock) : 0,
        }));
        setProduits(formattedProduits);
      })
      .catch(err => console.error('Erreur chargement produits:', err));
  }, []);

  useEffect(() => {
    const p = produits.find(prod => prod.value === produitRef);
    if (p) {
      setQuantiteStock(p.quantite_stock);
      setLongueurParRouleau(p.longueur_par_rouleau);
    } else {
      setQuantiteStock(0);
      setLongueurParRouleau(0);
    }
    setQuantite('');
    setRouleaux('');
    setMetres('');
    setRouleauxVirtuels(0);
  }, [produitRef, produits]);

  const fetchCommandes = useCallback(async () => {
    try {
      const res = await axios.get(' https://9a1123bcdc46.ngrok-free.app/api/commandes');
      setCommandes(res.data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommandes().finally(() => setRefreshing(false));
  };

  const produitSelectionne = produits.find(p => p.value === produitRef);
  const islaniere = produitSelectionne?.label?.toLowerCase().includes('roul');

  const handleMetresChange = text => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    setMetres(cleanText);
    const metresValue = parseFloat(cleanText);
    if (!isNaN(metresValue) && longueurParRouleau > 0) {
      setRouleauxVirtuels(Math.floor(metresValue / longueurParRouleau));
    } else {
      setRouleauxVirtuels(0);
    }
  };

  const handleRouleauxChange = text => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setRouleaux(cleanText);
  };

  const handleSubmit = async () => {
    if (!clientId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un client.');
      return;
    }
    if (!produitRef) {
      Alert.alert('Erreur', 'Veuillez sélectionner un produit.');
      return;
    }

    if (islaniere) {
      const r = parseFloat(rouleaux);
      const m = parseFloat(metres);

      if ((isNaN(r) || r <= 0) && (isNaN(m) || m <= 0)) {
        Alert.alert('Erreur', 'Veuillez renseigner au moins un champ : rouleaux ou mètres.');
        return;
      }

      const rVal = isNaN(r) ? 0 : r;
      const mVal = isNaN(m) ? 0 : m;

      const maxMetres = quantiteStock * longueurParRouleau;
      const totalMetres = rVal * longueurParRouleau + mVal;

      if (totalMetres > maxMetres) {
        Alert.alert(
          'Erreur',
          `La quantité totale (${totalMetres} m) dépasse le stock disponible (${maxMetres} m).`
        );
        return;
      }

      try {
        await axios.post(' https://9a1123bcdc46.ngrok-free.app/api/commandes', {
          client_id: clientId,
          produit_reference: produitRef,
          quantite_commande: totalMetres,
          metres_commandees: totalMetres,
        });

        Alert.alert('Succès', 'Commande enregistrée.');
        setClientId(null);
        setProduitRef(null);
        setQuantite('');
        setRouleaux('');
        setMetres('');
        setRouleauxVirtuels(0);
        fetchCommandes();
      } catch (err) {
        console.error('Erreur enregistrement commande:', err);
        Alert.alert('Erreur', "L'enregistrement a échoué.");
      }
    } else {
      const qte = parseFloat(quantite);

      if (!qte || qte <= 0) {
        Alert.alert('Erreur', 'Veuillez entrer une quantité valide.');
        return;
      }

      if (qte > quantiteStock) {
        Alert.alert('Erreur', `Stock insuffisant. Stock disponible: ${quantiteStock}`);
        return;
      }

      try {
        await axios.post(' https://9a1123bcdc46.ngrok-free.app/api/commandes', {
          client_id: clientId,
          produit_reference: produitRef,
          quantite_commande: qte,
        });

        Alert.alert('Succès', 'Commande enregistrée.');
        setClientId(null);
        setProduitRef(null);
        setQuantite('');
        fetchCommandes();
      } catch (err) {
        console.error('Erreur enregistrement commande:', err);
        Alert.alert('Erreur', "L'enregistrement a échoué.");
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: 300, textAlign: 'left' }]}>{item.nom_client}</Text>
      <Text style={[styles.cell, { width: 400, textAlign: 'left' }]}>{item.designation_produit}</Text>
      <Text style={[styles.cell, { width: 170 }]}>
        {item.metres_commandees && item.metres_commandees > 0
          ? `${item.metres_commandees} m`
          : item.quantite_commande}
      </Text>
      <Text style={[styles.cell, { width: 150 }]}>{item.date_commande}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des commandes</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'form' && styles.activeTab]}
          onPress={() => setTab('form')}
        >
          <Text style={[styles.tabText, tab === 'form' && { color: 'white' }]}>
            + Nouvelle commande
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'list' && styles.activeTab]}
          onPress={() => setTab('list')}
        >
          <Text style={[styles.tabText, tab === 'list' && { color: 'white' }]}>
            📄 Commandes passées
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'form' ? (
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
          <Text>Client :</Text>
          <DropDownPicker
            open={openClient}
            value={clientId}
            items={clients}
            setOpen={setOpenClient}
            setValue={setClientId}
            setItems={setClients}
            searchable
            placeholder="Sélectionner un client"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            searchPlaceholder="Rechercher un client..."
            listMode="MODAL"
            modalProps={{ animationType: 'slide' }}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <Text>Produit :</Text>
          <DropDownPicker
            open={openProduit}
            value={produitRef}
            items={produits}
            setOpen={setOpenProduit}
            setValue={setProduitRef}
            setItems={setProduits}
            searchable
            placeholder="Sélectionner un produit"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            searchPlaceholder="Rechercher un produit..."
            listMode="MODAL"
            modalProps={{ animationType: 'slide' }}
            zIndex={2000}
            zIndexInverse={2000}
          />

          {produitSelectionne && (
            <View style={styles.stockBox}>
              <Text style={styles.stockText}>
                Stock disponible : {formatStock(quantiteStock, longueurParRouleau)}
              </Text>
              {islaniere && longueurParRouleau > 0 && (
                <Text style={styles.stockText}>
                  Longueur par rouleau : {longueurParRouleau} m
                </Text>
              )}
            </View>
          )}

          {islaniere ? (
            <>
              <Text>Nombre de rouleaux :</Text>
              <TextInput
                placeholder="Ex: 2"
                value={rouleaux}
                onChangeText={handleRouleauxChange}
                keyboardType="numeric"
                style={styles.input}
              />
              <Text>Mètres :</Text>
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="Ex: 10"
                  value={metres}
                  onChangeText={handleMetresChange}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1 }]}
                />
                {metres !== '' && <Text style={styles.unit}>m</Text>}
              </View>
              {rouleauxVirtuels > 0 && (
                <Text style={styles.rouleauInfo}>≈ {rouleauxVirtuels} rouleau(x) virtuel(s)</Text>
              )}
            </>
          ) : (
            <>
              <Text>Quantité :</Text>
              <TextInput
                placeholder="Ex: 5"
                value={quantite}
                onChangeText={setQuantite}
                keyboardType="numeric"
                style={styles.input}
              />
            </>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Enregistrer la commande</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView horizontal>
          <FlatList
            data={commandes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={() => (
              <View style={[styles.row, styles.header]}>
                <Text style={[styles.cell, styles.headerText, { width: 300 }]}>Client</Text>
                <Text style={[styles.cell, styles.headerText, { width: 400 }]}>Produit</Text>
                <Text style={[styles.cell, styles.headerText, { width: 170 }]}>Quantité</Text>
                <Text style={[styles.cell, styles.headerText, { width: 150 }]}>Date</Text>
              </View>
            )}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f1f5f9', flex: 1 },
  title: { fontSize: 24, marginBottom: 15, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', marginBottom: 20 },
  tabButton: {
    flex: 1,
    backgroundColor: '#dbeafe',
    padding: 10,
    alignItems: 'center',
    marginRight: 5,
    borderRadius: 8,
  },
  activeTab: { backgroundColor: '#2563eb' },
  tabText: { color: '#2563eb', fontWeight: 'bold' },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    zIndex: 9999,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
  },
  cell: { paddingHorizontal: 10, textAlign: 'center' },
  header: { backgroundColor: '#1d4ed8' },
  headerText: { color: 'white', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitText: { color: 'white', fontWeight: 'bold' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rouleauInfo: {
    fontStyle: 'italic',
    color: 'gray',
  },
  stockBox: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#eef',
    padding: 8,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 14,
  },
});

export default CommandesScreen;
