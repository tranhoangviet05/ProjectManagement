import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, Heart, MapPin, MessageCircle, Repeat2 } from "lucide-react-native";
import AppText from "../../../components/common/AppText";
import { colors, radius, spacing } from "../../../theme/tokens";
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
    .slice(0, 14);
}

function ThreadsMasonryCard({ post, onPressPost, onPressService }) {
  const firstMedia = Array.isArray(post.media) && post.media.length > 0 ? post.media[0] : null;
  const hasImage = Boolean(firstMedia?.media_url);
  const authorName = post.author?.name || "Tín đồ du lịch";
  const handle = `@${makeHandle(authorName)}`;

  return (
    <Pressable
      onPress={() => onPressPost?.(post)}
      style={({ pressed }) => [styles.threadCard, pressed && { opacity: 0.94 }]}
      accessibilityRole="button"
    >
      {/* Header mang vibe Threads: Avatar + @handle + thời gian tương đối */}
      <View style={styles.threadHeader}>
        <View style={styles.avatarColumn}>
          {post.author?.avatar_url ? (
            <Image source={{ uri: post.author.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <AppText style={styles.avatarFallbackText}>{getInitials(authorName)}</AppText>
            </View>
          )}
          {/* Đường kẻ thread dọc tinh tế */}
          <View style={styles.threadLine} />
        </View>

        <View style={styles.threadContentCol}>
          <View style={styles.authorMetaRow}>
            <AppText style={styles.handleText} numberOfLines={1}>
              {handle}
            </AppText>
            <AppText style={styles.timeText}>{formatRelativeTime(post.created_at)}</AppText>
          </View>

          <AppText style={styles.postBodyText} numberOfLines={hasImage ? 4 : 6}>
            {post.content}
          </AppText>
        </View>
      </View>

      {/* Nếu có ảnh đính kèm thì thẻ sẽ lớn hơn rõ rệt (tạo nhịp Masonry tự nhiên) */}
      {hasImage ? (
        <View style={styles.mediaBox}>
          <Image
            source={{ uri: firstMedia.media_url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Dịch vụ gắn kèm (nếu có) */}
      {post.service?.title ? (
        <Pressable style={styles.serviceAttachPill} onPress={() => onPressService?.(post.service)}>
          <MapPin size={11} color={colors.brandPrimary} />
          <AppText style={styles.serviceAttachText} numberOfLines={1}>
            {post.service.title}
          </AppText>
        </Pressable>
      ) : null}

      {/* Thanh tương tác tối giản chuẩn Threads */}
      <View style={styles.actionRow}>
        <View style={styles.actionItem}>
          <Heart size={14} color={colors.inkBody} />
          <AppText style={styles.actionCount}>{post.likes_count || 0}</AppText>
        </View>
        <View style={styles.actionItem}>
          <MessageCircle size={14} color={colors.inkBody} />
          <AppText style={styles.actionCount}>{post.comments_count || 0}</AppText>
        </View>
        <View style={styles.actionItem}>
          <Repeat2 size={14} color={colors.inkBody} />
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Danh sách Bài đăng nổi bật sắp xếp dạng Masonry Waterfall 2 cột (Shopee / TikTok Shop / CapCut)
 * kết hợp thẩm mỹ tối giản của mạng xã hội Threads.
 */
export default function ThreadsMasonryFeed({
  posts = [],
  onPressPost,
  onPressService,
  onPressSeeAll,
}) {
  const { leftColumn, rightColumn } = useMemo(() => {
    const left = [];
    const right = [];
    let leftWeight = 0;
    let rightWeight = 0;

    posts.forEach((post) => {
      const hasMedia = Array.isArray(post.media) && post.media.length > 0;
      const textWeight = Math.min(1.8, (post.content?.length || 60) / 100);
      const cardWeight = (hasMedia ? 2.6 : 1.0) + textWeight;

      if (leftWeight <= rightWeight) {
        left.push(post);
        leftWeight += cardWeight;
      } else {
        right.push(post);
        rightWeight += cardWeight;
      }
    });

    return { leftColumn: left, rightColumn: right };
  }, [posts]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <AppText style={styles.sectionTitle}>Bài đăng nổi bật</AppText>
          <AppText style={styles.sectionSubtitle}>Góc chia sẻ thực tế từ cộng đồng du lịch</AppText>
        </View>
        <Pressable onPress={onPressSeeAll} style={styles.seeAllBtn}>
          <AppText style={styles.seeAllText}>Khám phá</AppText>
          <ChevronRight size={16} color={colors.brandPrimary} />
        </Pressable>
      </View>

      <View style={styles.masonryGrid}>
        <View style={styles.masonryCol}>
          {leftColumn.map((post) => (
            <ThreadsMasonryCard
              key={post.id}
              post={post}
              onPressPost={onPressPost}
              onPressService={onPressService}
            />
          ))}
        </View>
        <View style={styles.masonryCol}>
          {rightColumn.map((post) => (
            <ThreadsMasonryCard
              key={post.id}
              post={post}
              onPressPost={onPressPost}
              onPressService={onPressService}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.inkPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: colors.inkBody,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingLeft: 8,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  masonryGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  masonryCol: {
    flex: 1,
    gap: 10,
  },
  threadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 11,
    gap: 8,
  },
  threadHeader: {
    flexDirection: "row",
    gap: 8,
  },
  avatarColumn: {
    alignItems: "center",
    width: 28,
  },
  avatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  threadLine: {
    width: 1.5,
    flex: 1,
    minHeight: 16,
    backgroundColor: "#E2E8F0",
    marginTop: 4,
    borderRadius: 1,
  },
  threadContentCol: {
    flex: 1,
    gap: 3,
  },
  authorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  handleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: colors.inkSubtle,
  },
  postBodyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#1E293B",
  },
  mediaBox: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    height: 156,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  serviceAttachPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F9FF",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  serviceAttachText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.brandPrimary,
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontSize: 11.5,
    color: colors.inkBody,
    fontWeight: "600",
  },
});
