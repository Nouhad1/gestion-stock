import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('h https://9a1123bcdc46.ngrok-free.app/api/produits');
      setProducts(res.data);
    } catch (error) {
      console.error('Erreur chargement produits :', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const filteredProducts = products.filter(product => {
    const search = searchText.toLowerCase();
    return (
      product.reference.toLowerCase().includes(search) ||
      product.designation.toLowerCase().includes(search)
    );
  });

  const renderHeader = () => (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.cell, styles.headerText, { flex: 3 }]}>Réf</Text>
      <Text style={[styles.cell, styles.headerText, { flex: 3 }]}>Désignation</Text>
      <Text style={[styles.cell, styles.headerText, { flex: 1.2 }]}>PU</Text>
      <Text style={[styles.cell, styles.headerText, { width: 200 }]}>Prix Moyen Achat</Text>
      <Text style={[styles.cell, styles.headerText, { flex: 1.3 }]}>Stock</Text>
      <Text style={[styles.cell, styles.headerText, { flex: 1.2 }]}>Disponibilité</Text>
    </View>
  );

  return (
    <>
      {/* Top bar avec titre et recherche */}
      <View style={styles.topBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Liste produits</Text>
        </View>

        <View style={styles.searchContainer}>
          {!showSearch ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowSearch(true)}
              accessibilityLabel="Ouvrir la recherche"
            >
              <Text style={styles.icon}>🔍</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par Réf ou Désignation..."
                value={searchText}
                onChangeText={setSearchText}
                clearButtonMode="while-editing"
                autoFocus={true}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowSearch(false);
                  setSearchText('');
                }}
                style={styles.closeButton}
                accessibilityLabel="Fermer la recherche"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Table des produits */}
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          {renderHeader()}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.reference}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              >
                <Text style={[styles.cell, { width: 120 }]}>{item.reference}</Text>
                <Text style={[styles.cell, { width: 350 }]}>{item.designation}</Text>
                <Text style={[styles.cell, { width: 100 }]}>{item.prix_unitaire}</Text>
                <Text style={[styles.cell, { width: 200 }]}>
                  {item.prix_moyen_achat
                    ? Number(item.prix_moyen_achat).toFixed(2) + ' MAD'
                    : '0.00 MAD'}
                </Text>
                <Text style={[styles.cell, { width: 160 }]}>
                  {/* Affiche stockAffiche si présent sinon quantite_stock brute */}
                  {item.stockAffiche ?? item.quantite_stock}
                </Text>
                <Text style={[styles.cell, { width: 120 }]}>
                  {item.quantite_stock > 5 ? 'Oui' : 'Non'}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                Aucun produit trouvé{searchText ? ` pour « ${searchText} »` : ''}
              </Text>
            }
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    maxWidth: 350,
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#1d4ed8',
    borderRadius: 30,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  icon: {
    fontSize: 22,
    color: '#fff',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3f5',
    borderRadius: 30,
    paddingHorizontal: 15,
    flex: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#222',
  },
  closeButton: {
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#888',
    fontWeight: 'bold',
  },
  tableContainer: {
    padding: 10,
    minWidth: 900,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  header: {
    backgroundColor: '#1d4ed8',
  },
  cell: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
});

export default ProductList;
