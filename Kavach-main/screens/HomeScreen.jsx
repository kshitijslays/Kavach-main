import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Delivery to</Text>
          <View style={styles.locationSelection}>
            <Text style={styles.selectedLocation}>Home</Text>
            <Ionicons name="chevron-down" size={16} color="#E23744" />
          </View>
        </View>

        <TouchableOpacity style={styles.profileIcon}>
          <FontAwesome name="user-circle" size={24} color="#E23744" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchText}>Search for restaurants or dishes</Text>
        </TouchableOpacity>

        {/* Food Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name="pizza" size={24} color="#E23744" />
              </View>
              <Text style={styles.categoryName}>Pizza</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name="fast-food" size={24} color="#E23744" />
              </View>
              <Text style={styles.categoryName}>Burger</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <MaterialIcons name="rice-bowl" size={24} color="#E23744" />
              </View>
              <Text style={styles.categoryName}>Sushi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <MaterialIcons name="icecream" size={24} color="#E23744" />
              </View>
              <Text style={styles.categoryName}>Dessert</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Restaurant Collections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top restaurants near you</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.restaurantsList}>
            <TouchableOpacity style={styles.restaurantCard}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800" }} 
                style={styles.restaurantImage} 
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>Burger King</Text>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.3</Text>
                  <Text style={styles.deliveryTime}> • 30 min</Text>
                </View>
                <Text style={styles.cuisineText}>Burgers, American</Text>
                <Text style={styles.offerText}>50% OFF | Use TRYNEW</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.restaurantCard}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" }} 
                style={styles.restaurantImage} 
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>Domino's Pizza</Text>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.1</Text>
                  <Text style={styles.deliveryTime}> • 25 min</Text>
                </View>
                <Text style={styles.cuisineText}>Pizza, Italian</Text>
                <Text style={styles.offerText}>60% OFF up to ₹120</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" }} 
            style={styles.promoImage}
          />
          <View style={styles.promoOverlay}>
            <View style={styles.promoIconContainer}>
              <MaterialIcons name="local-offer" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.promoText}>50% OFF up to ₹100</Text>
            <Text style={styles.promoCode}>Use code ZOMATO</Text>
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick filters</Text>
          <View style={styles.filtersContainer}>
            <TouchableOpacity style={styles.filterItem}>
              <MaterialIcons name="delivery-dining" size={20} color="#E23744" />
              <Text style={styles.filterText}>Fast Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterItem}>
              <MaterialIcons name="restaurant" size={20} color="#E23744" />
              <Text style={styles.filterText}>Pure Veg</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterItem}>
              <MaterialIcons name="star" size={20} color="#E23744" />
              <Text style={styles.filterText}>Top Rated</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterItem}>
              <MaterialIcons name="discount" size={20} color="#E23744" />
              <Text style={styles.filterText}>Great Offers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  locationContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
  locationSelection: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedLocation: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 4,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#E23744",
    fontWeight: "600",
  },
  categoriesList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  categoryItem: {
    width: 80,
    alignItems: "center",
    marginHorizontal: 8,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8E8E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  restaurantsList: {
    paddingHorizontal: 8,
  },
  restaurantCard: {
    width: width * 0.7,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: "100%",
    height: 150,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
    marginRight: 8,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#666",
  },
  cuisineText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  offerText: {
    fontSize: 12,
    color: "#E23744",
    fontWeight: "600",
  },
  promoBanner: {
    height: 160,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: "hidden",
    position: "relative",
  },
  promoImage: {
    width: "100%",
    height: "100%",
  },
  promoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  promoIconContainer: {
    position: "absolute",
    top: -30,
    right: 20,
    backgroundColor: "#E23744",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  promoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  promoCode: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  filterItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8E8E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
});