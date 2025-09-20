import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function FoodDetailScreen() {
  return (
    <View style={styles.container}>
      {/* Food Image Header */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} 
        style={styles.foodImage}
      />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Favorite Button */}
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart" size={24} color="#E23744" />
      </TouchableOpacity>

      <ScrollView style={styles.contentContainer}>
        {/* Food Title and Price */}
        <View style={styles.titleContainer}>
          <Text style={styles.foodTitle}>Veggie Delight</Text>
          <Text style={styles.foodPrice}>$12</Text>
        </View>

        {/* Calories */}
        <View style={styles.calorieBadge}>
          <MaterialIcons name="local-fire-department" size={16} color="#E23744" />
          <Text style={styles.calorieText}>520 kcal</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          A colorful mix of fresh veggies, avocado, and hummus served on a warm artisan bun. 
          Packed with vitamins and bursting with flavor.
        </Text>

        {/* Nutrition Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>520 kcal</Text>
              <Text style={styles.nutritionLabel}>Energy</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>65 g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>18 g</Text>
              <Text style={styles.nutritionLabel}>Fats</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>15 g</Text>
              <Text style={styles.nutritionLabel}>Proteins</Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            <View style={styles.ingredientItem}>
              <Ionicons name="ellipse" size={8} color="#E23744" style={styles.bullet} />
              <Text style={styles.ingredientText}>Avocado</Text>
            </View>
            <View style={styles.ingredientItem}>
              <Ionicons name="ellipse" size={8} color="#E23744" style={styles.bullet} />
              <Text style={styles.ingredientText}>Lettuce</Text>
            </View>
            <View style={styles.ingredientItem}>
              <Ionicons name="ellipse" size={8} color="#E23744" style={styles.bullet} />
              <Text style={styles.ingredientText}>Hummus</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendations}>
            <TouchableOpacity style={styles.recommendationCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }} 
                style={styles.recommendationImage}
              />
              <Text style={styles.recommendationTitle}>Fruit Salad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recommendationCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400' }} 
                style={styles.recommendationImage}
              />
              <Text style={styles.recommendationTitle}>Pasta Primavera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recommendationCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }} 
                style={styles.recommendationImage}
              />
              <Text style={styles.recommendationTitle}>Veggie Pizza</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.addToCartButton}>
        <Text style={styles.addToCartText}>ADD TO CART</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  foodImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  foodPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E23744',
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  calorieText: {
    fontSize: 14,
    color: '#E23744',
    marginLeft: 5,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#777',
  },
  ingredientsList: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 15,
    color: '#555',
  },
  recommendations: {
    marginTop: 10,
  },
  recommendationCard: {
    width: 150,
    marginRight: 15,
  },
  recommendationImage: {
    width: 150,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#E23744',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});