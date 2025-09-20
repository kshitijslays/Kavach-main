import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Profile Header with Background */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <FontAwesome name="user-circle" size={90} color="#E23744" />
        </View>
        <Text style={styles.profileName}>Kshitij</Text>
        <Text style={styles.profileEmail}>kshitij123@gmail.com</Text>
      </View>

      {/* Premium Card */}
      <View style={styles.premiumCard}>
        <View style={styles.premiumBadge}>
          <MaterialIcons name="workspace-premium" size={20} color="#d1ab00" />
          <Text style={styles.premiumBadgeText}>GOLD MEMBER</Text>
        </View>
        <Text style={styles.premiumTitle}>Enjoy exclusive benefits!</Text>
        <Text style={styles.premiumBenefit}>• Free delivery on all orders</Text>
        <Text style={styles.premiumBenefit}>• Priority customer support</Text>
        <Text style={styles.premiumBenefit}>• Special discounts</Text>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>UPGRADE BENEFITS</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="person-outline" size={22} color="#E23744" />
          </View>
          <Text style={styles.settingText}>My Account</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="fast-food-outline" size={22} color="#E23744" />
          </View>
          <Text style={styles.settingText}>My Orders</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="wallet-outline" size={22} color="#E23744" />
          </View>
          <Text style={styles.settingText}>Payments</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="heart-outline" size={22} color="#E23744" />
          </View>
          <Text style={styles.settingText}>Favorites</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="moon-outline" size={22} color="#E23744" />
          </View>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch 
            trackColor={{ false: "#ddd", true: "#E23744" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>FoodApp v2.4.1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 25,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 15,
    color: '#777',
  },
  premiumCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  premiumBadgeText: {
    color: '#d1ab00',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  premiumBenefit: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    marginLeft: 5,
  },
  upgradeButton: {
    backgroundColor: '#E23744',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    marginLeft: 10,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 30,
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    marginBottom: 20,
    fontSize: 12,
  },
});