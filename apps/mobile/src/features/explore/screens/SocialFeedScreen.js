import React from "react";
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { Heart, MapPin, MessageCircle, PenSquare, Repeat2, Send } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme/tokens";
import { useExploreData } from "../context/ExploreDataContext";
import { useAuth } from "../../../hooks/useAuth";
import { formatRelativeTime } from "../models/exploreModel";

function getInitials(name = "Du khách") {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function makeHandle(name = "traveler") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 16);
}

/**
 * Tab "Khám phá" — Mạng xã hội du lịch mang phong cách tối giản của Threads.
 */
export default function SocialFeedScreen({ navigation }) {
  const isFocused = useIsFocused();
  const { featuredPosts, isRefreshing, refreshExploreData } = useExploreData();
  const { isAuthenticated } = useAuth();

  const handleComposePress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Đăng nhập để chia sẻ",
        "Hãy đăng nhập để đăng bài review hành trình và chia sẻ trải nghiệm cùng cộng đồng.",
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Auth", { initialMode: "login" }),
          },
        ],
      );
      return;
    }
    Alert.alert(
      "Đăng bài mới",
      "Tính năng soạn thảo bài đăng mạng xã hội sẽ ra mắt ở bản tiếp theo.",
    );
  };

  const handleInteract = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Cần đăng nhập",
        "Đăng nhập để thả tim, bình luận và lưu lại các bài review du lịch yêu thích.",
        [
          { text: "Đóng", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Auth", { initialMode: "login" }),
          },
        ],
      );
      return;
    }
    Alert.alert("Thông báo", "Tính năng tương tác bài viết đang được hoàn thiện.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="dark" /> : null}
      <View style={styles.header}>
        <View>
          <AppText style={styles.headerTitle}>Khám phá</AppText>
          <AppText style={styles.headerSub}>Cộng đồng du lịch Social Travel Booking</AppText>
        </View>
        <Pressable
          onPress={handleComposePress}
          style={styles.composeBtn}
          accessibilityRole="button"
          accessibilityLabel="Đăng bài mới"
        >
          <PenSquare size={19} color={colors.brandPrimary} />
        </Pressable>
      </View>

      <FlatList
        data={featuredPosts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshExploreData} />}
        renderItem={({ item }) => {
          const authorName = item.author?.name || "Du khách";
          const firstMedia =
            Array.isArray(item.media) && item.media.length > 0 ? item.media[0] : null;
          return (
            <View style={styles.threadPost}>
              <View style={styles.leftRail}>
                {item.author?.avatar_url ? (
                  <Image source={{ uri: item.author.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <AppText style={styles.avatarFallbackText}>{getInitials(authorName)}</AppText>
                  </View>
                )}
                <View style={styles.verticalThreadLine} />
              </View>

              <View style={styles.rightBody}>
                <View style={styles.metaHeader}>
                  <AppText style={styles.authorHandle}>@{makeHandle(authorName)}</AppText>
                  <AppText style={styles.dotSep}>·</AppText>
                  <AppText style={styles.timeAgo}>{formatRelativeTime(item.created_at)}</AppText>
                </View>

                <AppText style={styles.contentText}>{item.content}</AppText>

                {firstMedia?.media_url ? (
                  <Image
                    source={{ uri: firstMedia.media_url }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                ) : null}

                {item.service?.title ? (
                  <Pressable
                    style={styles.serviceChip}
                    onPress={() =>
                      navigation.navigate("Detail", {
                        serviceId: item.service.id,
                        tour: item.service,
                      })
                    }
                  >
                    <MapPin size={13} color={colors.brandPrimary} />
                    <AppText style={styles.serviceChipText} numberOfLines={1}>
                      {item.service.title}
                    </AppText>
                  </Pressable>
                ) : null}

                <View style={styles.actionsBar}>
                  <Pressable onPress={handleInteract} style={styles.actionBtn}>
                    <Heart size={18} color={colors.inkPrimary} />
                    <AppText style={styles.actionCount}>{item.likes_count || 0}</AppText>
                  </Pressable>
                  <Pressable onPress={handleInteract} style={styles.actionBtn}>
                    <MessageCircle size={18} color={colors.inkPrimary} />
                    <AppText style={styles.actionCount}>{item.comments_count || 0}</AppText>
                  </Pressable>
                  <Pressable onPress={handleInteract} style={styles.actionBtn}>
                    <Repeat2 size={18} color={colors.inkPrimary} />
                  </Pressable>
                  <Pressable onPress={handleInteract} style={styles.actionBtn}>
                    <Send size={17} color={colors.inkPrimary} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <AppText style={styles.emptyTitle}>Chưa có bài đăng nào</AppText>
            <AppText style={styles.emptyDesc}>
              Kéo xuống để làm mới hoặc quay lại sau để xem chia sẻ từ cộng đồng du lịch.
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.inkPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: colors.inkSubtle,
    marginTop: 1,
  },
  composeBtn: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    borderRadius: 22,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  feedContent: {
    paddingBottom: 120,
  },
  threadPost: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  leftRail: {
    alignItems: "center",
    width: 38,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  verticalThreadLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
    borderRadius: 1,
  },
  rightBody: {
    flex: 1,
    gap: 8,
  },
  metaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorHandle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  dotSep: {
    fontSize: 13,
    color: colors.inkSubtle,
  },
  timeAgo: {
    fontSize: 12.5,
    color: colors.inkSubtle,
  },
  contentText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: "#1E293B",
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  serviceChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.brandPrimary,
    flexShrink: 1,
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkBody,
  },
  emptyBox: {
    alignItems: "center",
    padding: spacing.xl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  emptyDesc: {
    fontSize: 13.5,
    color: colors.inkBody,
    textAlign: "center",
  },
});
