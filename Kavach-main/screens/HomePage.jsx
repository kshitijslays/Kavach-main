import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Sample data with more details
const touristPlaces = [
  {
    id: "1",
    name: "Taj Mahal",
    description:
      "Iconic white marble mausoleum in Agra, built by Mughal Emperor Shah Jahan.",
    image:
      "https://treasuretripin.com/wp-content/uploads/2023/12/SECRETS-TO-EXPERIENCE-IN-TAJ-MAHAL.png",
    category: "Monument",
    rating: 4.8,
    reviews: 12453,
    price: 50,
    location: "Agra, Uttar Pradesh",
    isFavorite: false,
    images: [
      "https://treasuretripin.com/wp-content/uploads/2023/12/SECRETS-TO-EXPERIENCE-IN-TAJ-MAHAL.png",
      "https://cdn.britannica.com/86/170586-050-AB7FEFAE/Taj-Mahal-Agra-India.jpg",
      "https://www.travelandleisure.com/thmb/7tXXKZPk_0sSXHkK9nFcQkUo1o=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/taj-mahal-agra-india-TAJ0217-9d8a5ddf5f324f8e8b2f2e4e5a7d0f6c.jpg",
    ],
  },
  {
    id: "2",
    name: "Gateway of India",
    description:
      "Famous monument in Mumbai by the Arabian Sea, built during British rule.",
    image:
      "https://i0.wp.com/theunstumbled.com/wp-content/uploads/2025/05/gateway-of-india-mumbai.jpg?fit=1200%2C800&ssl=1",
    category: "Monument",
    rating: 4.5,
    reviews: 8765,
    price: 0,
    location: "Mumbai, Maharashtra",
    isFavorite: false,
    images: [
      "https://i0.wp.com/theunstumbled.com/wp-content/uploads/2025/05/gateway-of-india-mumbai.jpg?fit=1200%2C800&ssl=1",
      "https://www.fabhotels.com/blog/wp-content/uploads/2019/05/Gateway-of-India_600-1280x720.jpg",
      "https://www.trawell.in/admin/images/upload/461674274Mumbai_Gateway_of_India_Main.jpg",
    ],
  },
  {
    id: "3",
    name: "Amarnath Cave",
    description:
      "One of the most important pilgrimage sites for Hindus dedicated to Lord Shiva.",
    image:
      "https://www.newsonair.gov.in/wp-content/uploads/2025/07/Amarnath-Yatra-2025-1.png",
    category: "Temple",
    rating: 4.9,
    reviews: 15678,
    price: 0,
    location: "Pahalgam, Jammu & Kashmir",
    isFavorite: false,
    images: [
      "https://www.newsonair.gov.in/wp-content/uploads/2025/07/Amarnath-Yatra-2025-1.png",
      "https://www.tourmyindia.com/states/jammuandkashmir/imagess/amarnath-yatra1.jpg",
      "https://cdn.s3waas.gov.in/s3858a7c5ed8a3c3b5054a0e8bbdc5d236/uploads/2018/06/2018062245.jpg",
    ],
  },
  {
    id: "4",
    name: "Shimla",
    description:
      "Picturesque hill station with colonial architecture and scenic mountain views.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsJPH4DqNGlh9MBpJTlzJ5tffn5wq8C8mLxw&s",
    category: "Mountain",
    rating: 4.6,
    reviews: 9876,
    price: 0,
    location: "Himachal Pradesh",
    isFavorite: false,
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsJPH4DqNGlh9MBpJTlzJ5tffn5wq8C8mLxw&s",
      "https://www.hlimg.com/images/things2do/738X538/1-1540546551.jpg",
      "https://www.tourmyindia.com/states/himachal/imagess/shimla2.jpg",
    ],
  },
  {
    id: "5",
    name: "Varanasi Ghats",
    description:
      "Spiritual capital of India with ancient temples and sacred Ganges river banks.",
    image:
      "https://www.andbeyond.com/wp-content/uploads/sites/5/iStock_000058485880_XXXLarge.jpg",
    category: "Temple",
    rating: 4.7,
    reviews: 11234,
    price: 0,
    location: "Varanasi, Uttar Pradesh",
    isFavorite: false,
    images: [
      "https://www.oyorooms.com/travel-guide/wp-content/uploads/2019/03/Varanasi-Ghats.jpg",
      "https://www.fabhotels.com/blog/wp-content/uploads/2019/02/Ghats-in-Varanasi.jpg",
      "https://static.toiimg.com/photo/77626241.cms",
    ],
  },
  {
    id: "6",
    name: "Goa Beaches",
    description:
      "Pristine beaches with golden sands, water sports, and vibrant nightlife.",
    image: "https://www.holidify.com/images/bgImages/GOA.jpg",
    category: "Beaches",
    rating: 4.5,
    reviews: 14567,
    price: 0,
    location: "Goa",
    isFavorite: false,
    images: [
      "https://www.holidify.com/images/bgImages/GOA.jpg",
      "https://www.tourism-of-india.com/blog/wp-content/uploads/2019/12/Beaches-in-Goa.jpg",
      "https://www.fabhotels.com/blog/wp-content/uploads/2019/05/Beaches-in-Goa_600-1280x720.jpg",
    ],
  },
  {
    id: "7",
    name: "DehraDun",
    description:
      "One of the most important pilgrimage sites for Hindus dedicated to Lord Shiva.",
    image:
      "https://www.manchalamushafir.com/chopta-uttarakhand-unveiling-the-serene-paradise-of-the-himalayas/images/chopta%20image.jpg",
    category: "Temple",
    rating: 4.9,
    reviews: 15678,
    price: 0,
    location: "Pahalgam, Jammu & Kashmir",
    isFavorite: false,
    images: [
      "https://www.newsonair.gov.in/wp-content/uploads/2025/07/Amarnath-Yatra-2025-1.png",
      "https://www.tourmyindia.com/states/jammuandkashmir/imagess/amarnath-yatra1.jpg",
      "https://cdn.s3waas.gov.in/s3858a7c5ed8a3c3b5054a0e8bbdc5d236/uploads/2018/06/2018062245.jpg",
    ],
  },
];

const categories = [
  { id: "1", name: "All", icon: "globe" },
  { id: "2", name: "Monument", icon: "landmark" },
  { id: "3", name: "Beaches", icon: "umbrella-beach" },
  { id: "4", name: "Mountains", icon: "mountain" },
  { id: "5", name: "Temple", icon: "pray" },
  { id: "6", name: "Wildlife", icon: "paw" },
  { id: "7", name: "Heritage", icon: "history" },
];

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [priceFilter, setPriceFilter] = useState("all");
  const [favorites, setFavorites] = useState({});

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 120],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const filteredPlaces = touristPlaces.filter((place) => {
    const matchesCategory =
      selectedCategory === "All" || place.category === selectedCategory;
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && place.price === 0) ||
      (priceFilter === "paid" && place.price > 0);

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortBy === "popular") return b.rating - a.rating;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const toggleFavorite = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCategorySelect = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const applyFilters = (sort, price) => {
    setSortBy(sort);
    setPriceFilter(price);
    setShowFilters(false);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.selectedCategory,
      ]}
      onPress={() => handleCategorySelect(item.name)}
      activeOpacity={0.7}
    >
      <FontAwesome5
        name={item.icon}
        size={16}
        color={selectedCategory === item.name ? "#fff" : "#03474f"}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.name && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderPlace = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PlaceDetail", { place: item })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.imageGradient}
      />

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons
          name={favorites[item.id] ? "heart" : "heart-outline"}
          size={22}
          color={favorites[item.id] ? "#ff4757" : "#fff"}
        />
      </TouchableOpacity>

      <View style={styles.cardBadge}>
        <Text style={styles.badgeText}>{item.category}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.cardDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>
              ({item.reviews.toLocaleString()})
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#fff" />
            <Text style={styles.locationText}>
              {item.location.split(",")[0]}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          {item.price > 0 ? (
            <Text style={styles.priceText}>₹{item.price}</Text>
          ) : (
            <Text style={styles.freeText}>Free Entry</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="search" size={48} color="#cbd5e1" />
      <Text style={styles.emptyText}>No places found</Text>
      <Text style={styles.emptySubText}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#03474f" />

      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, opacity: headerOpacity },
        ]}
      >
        <LinearGradient
          colors={["#03474f", "#026873"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Discover India</Text>
          <Text style={styles.subGreeting}>
            Explore the beauty of incredible India
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#64748b"
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              placeholder="Search places..."
              placeholderTextColor="#64748b"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Feather name="filter" size={20} color="#03474f" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {sortedPlaces.length} {sortedPlaces.length === 1 ? "Place" : "Places"}{" "}
          Found
        </Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={styles.filterText}>Sort & Filter</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={sortedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderPlace}
        contentContainerStyle={styles.grid}
        numColumns={2}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#03474f"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#03474f" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              {["popular", "name", "reviews"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    sortBy === option && styles.selectedFilterOption,
                  ]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      sortBy === option && styles.selectedFilterOptionText,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price</Text>
            <View style={styles.filterOptions}>
              {["all", "free", "paid"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    priceFilter === option && styles.selectedFilterOption,
                  ]}
                  onPress={() => setPriceFilter(option)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      priceFilter === option && styles.selectedFilterOptionText,
                    ]}
                  >
                    {option === "all"
                      ? "All"
                      : option === "free"
                        ? "Free"
                        : "Paid"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => applyFilters(sortBy, priceFilter)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#03474f",
    padding: 20,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  headerContent: {
    zIndex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: "#e2e8f0",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#0f172a",
  },
  filterButton: {
    backgroundColor: "#e2e8f0",
    padding: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginVertical: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: "#03474f",
  },
  categoryText: {
    marginLeft: 8,
    color: "#03474f",
    fontWeight: "600",
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "#fff",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  filterText: {
    fontSize: 14,
    color: "#03474f",
    fontWeight: "600",
  },
  grid: {
    padding: 8,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  cardBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#03474f",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#fff",
    fontSize: 12,
  },
  reviewsText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    marginLeft: 4,
  },
  priceContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: "#03474f",
    fontWeight: "700",
    fontSize: 12,
  },
  freeText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  selectedFilterOption: {
    backgroundColor: "#03474f",
  },
  filterOptionText: {
    color: "#64748b",
    fontWeight: "500",
  },
  selectedFilterOptionText: {
    color: "#fff",
  },
  applyButton: {
    backgroundColor: "#03474f",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
