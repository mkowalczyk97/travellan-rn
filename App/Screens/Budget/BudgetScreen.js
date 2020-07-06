import React, {useState} from 'react';
import {View, ScrollView, Text, TouchableOpacity, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/** IMPORTS FROM WITHIN THE MODULE */
import Card from '../../Components/Atoms/Card';
import {budgetScreenStyle as styles} from './BudgetScreenStyle';
import Colors from '../../Constants/Colors';
import BUDGET from '../../Data/DummyBudget';

const BudgetScreen = (props) => {
  const activeCurrencies = BUDGET;
  const [selectedCurrency, setSelectedCurrency] = useState(activeCurrencies[0]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {/* HORIZONTAL FLATLIST OF CURRENCIES */}
      <View style={styles.currenciesContainer}>
        <FlatList
          horizontal
          data={activeCurrencies}
          ItemSeparatorComponent={() => (
            <Icon style={[styles.text, styles.icon]} name="power-on" />
          )}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.currencyHolder}
              onPress={() => setSelectedCurrency(item)}>
              <Text
                style={
                  selectedCurrency.currency === item.currency
                    ? styles.currencyActive
                    : styles.currencyNonactive
                }>
                {item.currency}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      {/* CURRENCY OPERATIONS AND HISTORY */}
      {selectedCurrency && (
        <View style={styles.detailsContainer}>
          <Card style={{marginTop: '5%', padding: 15}}>
            <Text style={styles.text}>{selectedCurrency.value}</Text>
          </Card>
          <View style={{marginTop: '5%'}}>
            <Text style={[styles.text, styles.label]}>History</Text>
            {selectedCurrency.history.map((item) => (
              <Card style={{marginTop: '5%', padding: 15}}>
                <View style={styles.justifyRow}>
                  <Text style={styles.text}>{item.value}</Text>
                  <Text style={styles.text}>{item.title}</Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default BudgetScreen;
