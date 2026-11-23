import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, MapPin, Search, X } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { resolveMediaUrl } from "../../../lib/apiClient";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import { useExploreData } from "../context/ExploreDataContext";

/**
 * Màn hình Xem tất cả các địa điểm du lịch Việt Nam (63 điểm đến từ LocationSeeder).
 */
export default function AllLocationsScreen({ navigation }) {
  const { locations } = useExploreData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) => loc.name?.toLowerCase().includes(q) || loc.parent?.name?.toLowerCase().includes(q),
    );
  }, [locations, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText style={styles.title}>Địa điểm du lịch Việt Nam</AppText>
          <AppText style={styles.subtitle}>{locations.length} tỉnh thành & khu du lịch</AppText>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Search size={16} color={colors.inkSubtle} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm tỉnh thành, đảo, khu du lịch..."
              placeholderTextColor={colors.inkSubtle}
              style={styles.searchInput}
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={15} color={colors.inkSubtle} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate("ServiceSearch", {
                  location_id: item.id,
                  location_name: item.name,
                })
              }
            >
              {item.image_url ? (
                <Image
                  source={{ uri: resolveMediaUrl(item.image_url) }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardPlaceholder}>
                  <MapPin size={22} color={colors.brandPrimary} />
                </View>
              )}
              <View style={styles.cardBody}>
                <AppText style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText style={styles.cardMeta} numberOfLines={1}>
                  {item.parent?.name
                    ? `Thuộc ${item.parent.name}`
                    : item.active_services_count > 0
                      ? `${item.active_services_count} dịch vụ`
                      : "Khám phá ngay"}
                </AppText>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <AppText style={styles.emptyText}>Không tìm thấy địa điểm nào khớp từ khóa.</AppText>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkSubtle,
  },
  searchWrap: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.inkPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  cardImg: {
    width: "100%",
    height: 92,
  },
  cardPlaceholder: {
    width: "100%",
    height: 92,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    padding: 10,
    gap: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  cardMeta: {
    fontSize: 11.5,
    color: colors.inkSubtle,
  },
  emptyText: {
    textAlign: "center",
    color: colors.inkSubtle,
    paddingVertical: spacing.xl,
  },
});
