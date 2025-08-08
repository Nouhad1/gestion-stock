import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Button, StyleSheet,
  ScrollView, Alert
} from 'react-native';
import axios from 'axios';

const EditableAchatTable = () => {
  const [achats, setAchats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newAchat, setNewAchat] = useState({
    produit_reference: '',
    quantite_achat: '',
    prix_achat: '',
  });

  const fetchAchats = () => {
    axios.get(' https://9a1123bcdc46.ngrok-free.app /api/achats')
      .then(res => {
        console.log('✅ Données achats :', res.data);
        setAchats(res.data);
      })
      .catch(err => {
        console.log('❌ Erreur API :', err.message);
        Alert.alert('Erreur', 'Impossible de charger les achats');
      });
  };

  useEffect(() => {
    fetchAchats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAchats();
    setRefreshing(false);
  };

  const updateAchat = (id, field, value) => {
    setAchats(prev =>
      prev.map(achat =>
        achat.id === id
          ? { ...achat, [field]: ['quantite_achat', 'prix_achat'].includes(field) ? Number(value) : value }
          : achat
      )
    );
  };

  const createAchat = () => {
    const produit_reference = newAchat.produit_reference.trim();
    const quantite_achat = Number(newAchat.quantite_achat);
    const prix_achat = Number(newAchat.prix_achat);

    if (!produit_reference || isNaN(quantite_achat) || quantite_achat <= 0 || isNaN(prix_achat) || prix_achat <= 0) {
      return Alert.alert("Champs requis", "Veuillez remplir tous les champs avec des valeurs valides");
    }

    axios.post(' https://9a1123bcdc46.ngrok-free.app /api/achats', {
      produit_reference,
      quantite_achat,
      prix_achat,
    })
    .then(() => {
      Alert.alert('✅ Achat ajouté');
      setNewAchat({ produit_reference: '', quantite_achat: '', prix_achat: '' });
      fetchAchats();
    })
    .catch(err => {
      console.log('❌ Erreur ajout :', err.response?.data || err.message);
      Alert.alert('Erreur', "Impossible d'ajouter l'achat");
    });
  };

  const saveAchat = (achat) => {
  const quantite = Number(achat.quantite_achat);
  const prix = Number(achat.prix_achat);

  if (isNaN(quantite) || quantite <= 0) {
    return Alert.alert("Erreur", "Quantité invalide");
  }
  if (isNaN(prix) || prix <= 0) {
    return Alert.alert("Erreur", "Prix d'achat invalide");
  }

  axios.put(` https://9a1123bcdc46.ngrok-free.app/api/achats/${achat.id}`, {
    quantite_achat: quantite,
    prix_achat: prix,  // Ajout de la mise à jour du prix d'achat
  })
  .then(() => {
    Alert.alert('✅ Succès', 'Achat mis à jour');
    fetchAchats();
  })
  .catch(err => {
    console.log('❌ Erreur sauvegarde complète :', err.response?.data || err.message);
    Alert.alert('Erreur', 'Échec de la mise à jour');
  });
};


  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: 120 }]}>{item.reference}</Text>
      <Text style={[styles.cell, { width: 300 }]}>{item.designation}</Text>
      <TextInput
        style={[styles.input, { width: 200 }]}
        keyboardType="numeric"
        value={String(item.quantite_achat)}
        onChangeText={text => updateAchat(item.id, 'quantite_achat', text)}
      />
      <TextInput
        style={[styles.input, { width: 200 }]}
        keyboardType="numeric"
        value={String(item.prix_achat)}
        onChangeText={text => updateAchat(item.id, 'prix_achat', text)}
      />
      <Text style={[styles.cell, { width: 200 }]}>{item.date_achat}</Text>
      <View style={styles.saveButtonContainer}>
        <Button title="💾" onPress={() => saveAchat(item)} />
      </View>
    </View>
  );

  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        <Text style={styles.title}>🧾 Tableau des Achats</Text>

        {/* Ligne d’ajout */}
        <View style={styles.row}>
          <TextInput
            placeholder="Référence"
            style={[styles.input, { width: 300 }]}
            value={newAchat.produit_reference}
            onChangeText={text => setNewAchat({ ...newAchat, produit_reference: text })}
          />
          <TextInput
            placeholder="Quantité"
            keyboardType="numeric"
            style={[styles.input, { width: 300 }]}
            value={newAchat.quantite_achat}
            onChangeText={text => setNewAchat({ ...newAchat, quantite_achat: text })}
          />
          <TextInput
            placeholder="Prix achat"
            keyboardType="numeric"
            style={[styles.input, { width: 300 }]}
            value={newAchat.prix_achat}
            onChangeText={text => setNewAchat({ ...newAchat, prix_achat: text })}
          />
          <Button
            title="➕"
            onPress={createAchat}
            disabled={
              !newAchat.produit_reference.trim() ||
              !newAchat.quantite_achat ||
              Number(newAchat.quantite_achat) <= 0 ||
              !newAchat.prix_achat ||
              Number(newAchat.prix_achat) <= 0
            }
          />
        </View>

        {/* En-têtes */}
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, { width: 120 }]}>Réf</Text>
          <Text style={[styles.cell, { width: 300 }]}>Désignation</Text>
          <Text style={[styles.cell, { width: 200 }]}>Quantité</Text>
          <Text style={[styles.cell, { width: 200 }]}>Prix Achat</Text>
          <Text style={[styles.cell, { width: 200 }]}>Date</Text>
          <Text style={[styles.cell, { width: 80 }]}>Action</Text>
        </View>

        <FlatList
          data={achats}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Aucun achat trouvé</Text>}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    minWidth: 800,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1145d3',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
  },
  header: {
    backgroundColor: '#ddd',
  },
  cell: {
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 4,
    padding: 4,
    marginHorizontal: 2,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#999',
  },
  saveButtonContainer: {
    width: 80,
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 6,
    marginLeft: 4,
    justifyContent: 'center',
  },
});

export default EditableAchatTable;
