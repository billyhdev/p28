import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchGroups, Group, initializeGroupData } from '../../services/groupService';

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'ministries' | 'forums'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await fetchGroups();
      if (fetchedGroups.length === 0) {
        // Initialize sample data if no groups exist
        await initializeGroupData();
        const sampleGroups = await fetchGroups();
        setGroups(sampleGroups);
      } else {
        setGroups(fetchedGroups);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      // Fallback to empty array
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (group: Group) => {
    router.push(`/screens/group-detail/${group.id}`);
  };

  // Get unique countries and languages for filter options
  const countries = ['all', ...Array.from(new Set(groups.map(g => g.country)))];
  const languages = ['all', ...Array.from(new Set(groups.map(g => g.language)))];

  const filteredGroups = groups.filter(group => {
    // Category filter
    if (activeCategory !== 'all' && group.category !== activeCategory) return false;
    
    // Country filter
    if (selectedCountry !== 'all' && group.country !== selectedCountry) return false;
    
    // Language filter
    if (selectedLanguage !== 'all' && group.language !== selectedLanguage) return false;
    
    return true;
  });

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity style={styles.groupCard} onPress={() => handleGroupPress(item)}>
      <Image source={{ uri: item.image }} style={styles.groupImage} />
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: item.category === 'ministries' ? '#E8F5E8' : '#F0F8FF' }
          ]}>
            <Text style={[
              styles.categoryText,
              { color: item.category === 'ministries' ? '#4CAF50' : '#007AFF' }
            ]}>
              {item.category === 'ministries' ? 'Ministry' : 'Forum'}
            </Text>
          </View>
        </View>
        <Text style={styles.groupDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#8E8E93" />
            <Text style={styles.statText}>{item.memberCount} members</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={16} color="#8E8E93" />
            <Text style={styles.statText}>{item.discussionCount} discussions</Text>
          </View>
        </View>
        
        <View style={styles.groupLocation}>
          <View style={styles.locationItem}>
            <Ionicons name="location" size={14} color="#8E8E93" />
            <Text style={styles.locationText}>{item.country}</Text>
          </View>
          <View style={styles.locationItem}>
            <Ionicons name="language" size={14} color="#8E8E93" />
            <Text style={styles.locationText}>{item.language}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Groups</Text>
          <Text style={styles.headerSubtitle}>
            Connect with communities and ministries
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <Text style={styles.headerSubtitle}>
          Connect with communities and ministries
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <TouchableOpacity
          style={[styles.categoryButton, activeCategory === 'all' && styles.activeCategoryButton]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.categoryButtonText, activeCategory === 'all' && styles.activeCategoryButtonText]}>
            All Groups
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.categoryButton, activeCategory === 'ministries' && styles.activeCategoryButton]}
          onPress={() => setActiveCategory('ministries')}
        >
          <Ionicons 
            name="home" 
            size={16} 
            color={activeCategory === 'ministries' ? '#FFFFFF' : '#007AFF'} 
          />
          <Text style={[styles.categoryButtonText, activeCategory === 'ministries' && styles.activeCategoryButtonText]}>
            Ministries
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.categoryButton, activeCategory === 'forums' && styles.activeCategoryButton]}
          onPress={() => setActiveCategory('forums')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={16} 
            color={activeCategory === 'forums' ? '#FFFFFF' : '#007AFF'} 
          />
          <Text style={[styles.categoryButtonText, activeCategory === 'forums' && styles.activeCategoryButtonText]}>
            Forums
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.activeFilterButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="filter" 
            size={16} 
            color={showFilters ? '#FFFFFF' : '#007AFF'} 
          />
          <Text style={[styles.filterButtonText, showFilters && styles.activeFilterButtonText]}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Filters */}
      {showFilters && (
        <View style={styles.advancedFilters}>
          {/* Country Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={[
                    styles.filterOption,
                    selectedCountry === country && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedCountry(country)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedCountry === country && styles.activeFilterOptionText
                  ]}>
                    {country === 'all' ? 'All Countries' : country}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Language Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.filterOption,
                    selectedLanguage === language && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedLanguage(language)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedLanguage === language && styles.activeFilterOptionText
                  ]}>
                    {language === 'all' ? 'All Languages' : language}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Clear Filters */}
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setSelectedCountry('all');
              setSelectedLanguage('all');
            }}
          >
            <Ionicons name="refresh" size={16} color="#007AFF" />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Groups Available</Text>
          <Text style={styles.emptySubtitle}>
            {activeCategory === 'all' 
              ? 'Check back later for new groups or pull to refresh'
              : `No ${activeCategory} available at the moment`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.groupsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  categoryFilter: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 22,
  },
  groupsList: {
    paddingVertical: 8,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  groupInfo: {
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 12,
    lineHeight: 24,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  advancedFilters: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F9FA',
  },
  activeFilterOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  groupLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
});
