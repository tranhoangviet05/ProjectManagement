import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Calendar, CheckCircle2, Clock, Tag, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import AppText from "../../../components/common/AppText";
import apiClient from "../../../lib/apiClient";
import { colors, radius, spacing } from "../../../theme/tokens";
import { formatCurrencyVnd } from "../models/exploreModel";

function addDaysIso(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Modal Đặt chỗ nhanh hỗ trợ cả Khách vãng lai (không cần đăng nhập) & Thành viên.
 * Kiểm tra đầy đủ thông tin bắt buộc, gọi /bookings/preview tính giá + cọc (0%/30%/100%)
 * và tạo đơn giữ chỗ 10 phút qua /public/bookings hoặc /tourist/bookings.
 */
export default function QuickBookingModal({
  visible,
  onClose,
  service,
  selectedRoom,
  selectedSlot,
  user,
  isAuthenticated,
}) {
  const navigation = useNavigation();
  const isStay = service?.type === "hotel" || service?.type === "homestay";
  const isTrain =
    service?.type === "train" ||
    String(service?.category?.slug || "")
      .toLowerCase()
      .includes("tau") ||
    String(service?.category?.name || "")
      .toLowerCase()
      .includes("vé tàu");
  const isVehicle = service?.type === "vehicle" && !isTrain;
  const needsEndDate = isStay || isVehicle;

  const [startDate, setStartDate] = useState(() =>
    selectedSlot?.available_date
      ? String(selectedSlot.available_date).slice(0, 10)
      : addDaysIso(new Date(), 1),
  );
  const [endDate, setEndDate] = useState(() => addDaysIso(new Date(), isStay ? 2 : 1));
  const [quantity, setQuantity] = useState("1");
  const [numAdults, setNumAdults] = useState("2");
  const [couponCode, setCouponCode] = useState("");
  const [depositRate, setDepositRate] = useState(null);

  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [specialRequests, setSpecialRequests] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setCreatedBooking(null);
    setPreviewError("");
    const initStart = selectedSlot?.available_date
      ? String(selectedSlot.available_date).slice(0, 10)
      : addDaysIso(new Date(), 1);
    setStartDate(initStart);
    setEndDate(addDaysIso(initStart, isStay ? 1 : 0));
    setContactName(user?.name || "");
    setContactPhone(user?.phone || "");
    setContactEmail(user?.email || "");
  }, [visible, selectedSlot, isStay, user]);

  const previewEndpoint = isAuthenticated
    ? "/tourist/bookings/preview"
    : "/public/bookings/preview";
  const createEndpoint = isAuthenticated ? "/tourist/bookings" : "/public/bookings";

  useEffect(() => {
    if (!visible || !service?.id || createdBooking) return;
    const qtyNum = Math.max(1, parseInt(quantity || "1", 10) || 1);
    const adultsNum = Math.max(1, parseInt(numAdults || "1", 10) || 1);

    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError("");
      try {
        const res = await apiClient.post(previewEndpoint, {
          service_id: service.id,
          room_type_id: selectedRoom?.id || undefined,
          start_date: startDate,
          end_date: needsEndDate ? endDate : undefined,
          quantity: qtyNum,
          deposit_rate: depositRate !== null ? depositRate : undefined,
          coupon_code: couponCode.trim() || undefined,
          metadata: {
            num_adults: adultsNum,
          },
        });
        if (!cancelled) {
          setPreview(res?.data || null);
          if (depositRate === null && res?.data?.deposit_rate !== undefined) {
            setDepositRate(res.data.deposit_rate);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(err?.message || "Không thể tính giá cho lựa chọn này.");
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 260);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    visible,
    service?.id,
    selectedRoom?.id,
    startDate,
    endDate,
    needsEndDate,
    quantity,
    numAdults,
    depositRate,
    couponCode,
    previewEndpoint,
    createdBooking,
  ]);

  const quantityLabel = useMemo(() => {
    if (isStay) return "Số phòng";
    if (isVehicle) return "Số xe";
    return "Số vé / khách";
  }, [isStay, isVehicle]);

  const handleSubmit = async () => {
    if (!contactName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên người liên hệ.");
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại liên hệ.");
      return;
    }
    if (!isAuthenticated && !contactEmail.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Khi đặt không cần đăng nhập, vui lòng nhập Email để nhận mã đơn và vé QR.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const qtyNum = Math.max(1, parseInt(quantity || "1", 10) || 1);
      const adultsNum = Math.max(1, parseInt(numAdults || "1", 10) || 1);
      const res = await apiClient.post(createEndpoint, {
        service_id: service.id,
        room_type_id: selectedRoom?.id || undefined,
        start_date: startDate,
        end_date: needsEndDate ? endDate : undefined,
        quantity: qtyNum,
        deposit_rate: depositRate !== null ? depositRate : undefined,
        coupon_code: couponCode.trim() || undefined,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
        special_requests: specialRequests.trim() || undefined,
        metadata: {
          num_adults: adultsNum,
        },
      });
      setCreatedBooking(res?.data || null);
    } catch (err) {
      Alert.alert("Không thể đặt chỗ", err?.message || "Vui lòng kiểm tra lại thông tin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.headerTitle}>
                {createdBooking ? "Đã tạo đơn đặt chỗ" : "Thông tin đặt chỗ"}
              </AppText>
              <AppText style={styles.headerSub} numberOfLines={1}>
                {service?.name}
                {isStay && selectedRoom ? ` · ${selectedRoom.name}` : ""}
              </AppText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.inkPrimary} />
            </Pressable>
          </View>

          {createdBooking ? (
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
              <View style={styles.successBox}>
                <CheckCircle2 size={34} color="#059669" />
                <AppText style={styles.successTitle}>Mã đơn: {createdBooking.booking_code}</AppText>
                <AppText style={styles.successDesc}>
                  {createdBooking.status === "confirmed"
                    ? "Đơn của bạn đã được xác nhận (thanh toán 0% tại nơi sử dụng)."
                    : "Đơn đang được giữ chỗ trong 10 phút chờ thanh toán."}
                </AppText>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <AppText style={styles.summaryLabel}>Tổng tiền đơn</AppText>
                  <AppText style={styles.summaryVal}>
                    {formatCurrencyVnd(createdBooking.total_amount)}
                  </AppText>
                </View>
                <View style={styles.summaryRow}>
                  <AppText style={styles.summaryLabel}>
                    Cần thanh toán trước ({createdBooking.deposit_rate}%)
                  </AppText>
                  <AppText style={[styles.summaryVal, { color: "#E11D48" }]}>
                    {formatCurrencyVnd(createdBooking.deposit_amount)}
                  </AppText>
                </View>
                {Number(createdBooking.remaining_amount) > 0 ? (
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryLabel}>Thanh toán khi nhận dịch vụ</AppText>
                    <AppText style={styles.summaryVal}>
                      {formatCurrencyVnd(createdBooking.remaining_amount)}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  const created = createdBooking;
                  onClose?.();
                  navigation.navigate("BookingDetail", {
                    bookingId: created.id,
                    bookingCode: created.booking_code,
                    contactPhone: created.contact_phone || contactPhone,
                    initialBooking: created,
                  });
                }}
              >
                <AppText style={styles.primaryBtnText}>Xem chi tiết đơn</AppText>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, { backgroundColor: "#F1F5F9", marginTop: 8 }]}
                onPress={onClose}
              >
                <AppText style={[styles.primaryBtnText, { color: colors.inkPrimary }]}>
                  Đóng
                </AppText>
              </Pressable>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              keyboardShouldPersistTaps="handled"
            >
              {!isAuthenticated ? (
                <View style={styles.guestNotice}>
                  <AppText style={styles.guestNoticeText}>
                    Bạn đang đặt với tư cách Khách (không cần đăng nhập). Vui lòng điền đầy đủ Họ
                    tên, SĐT và Email để nhận mã vé.
                  </AppText>
                </View>
              ) : null}

              <View style={styles.row2}>
                <View style={styles.fieldCol}>
                  <AppText style={styles.label}>
                    <Calendar size={12} color={colors.brandPrimary} /> Ngày bắt đầu *
                  </AppText>
                  <TextInput
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    style={styles.input}
                  />
                </View>
                {needsEndDate ? (
                  <View style={styles.fieldCol}>
                    <AppText style={styles.label}>Ngày kết thúc *</AppText>
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      style={styles.input}
                    />
                  </View>
                ) : null}
              </View>

              <View style={styles.row2}>
                <View style={styles.fieldCol}>
                  <AppText style={styles.label}>{quantityLabel} *</AppText>
                  <TextInput
                    value={quantity}
                    onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ""))}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                {isStay ? (
                  <View style={styles.fieldCol}>
                    <AppText style={styles.label}>Số người lớn</AppText>
                    <TextInput
                      value={numAdults}
                      onChangeText={(t) => setNumAdults(t.replace(/[^0-9]/g, ""))}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                ) : null}
              </View>

              {Array.isArray(preview?.allowed_deposit_rates) &&
              preview.allowed_deposit_rates.length > 1 ? (
                <View style={styles.fieldBlock}>
                  <AppText style={styles.label}>Hình thức thanh toán trước</AppText>
                  <View style={styles.rateRow}>
                    {preview.allowed_deposit_rates.map((rate) => {
                      const active = depositRate === rate;
                      return (
                        <Pressable
                          key={rate}
                          onPress={() => setDepositRate(rate)}
                          style={[styles.rateChip, active && styles.rateChipActive]}
                        >
                          <AppText
                            style={[styles.rateChipText, active && styles.rateChipTextActive]}
                          >
                            {rate === 0 ? "Trả sau 0%" : rate === 30 ? "Cọc 30%" : "Trả đủ 100%"}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              <View style={styles.fieldBlock}>
                <AppText style={styles.label}>
                  <Tag size={12} color={colors.brandPrimary} /> Mã giảm giá (Coupon)
                </AppText>
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="VD: WELCOME100K, TRAVEL10..."
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldBlock}>
                <AppText style={styles.label}>Họ và tên người liên hệ *</AppText>
                <TextInput
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="Nguyễn Văn A"
                  style={styles.input}
                />
              </View>

              <View style={styles.row2}>
                <View style={styles.fieldCol}>
                  <AppText style={styles.label}>Số điện thoại *</AppText>
                  <TextInput
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="0901234567"
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldCol}>
                  <AppText style={styles.label}>
                    Email {!isAuthenticated ? "*" : "(tùy chọn)"}
                  </AppText>
                  <TextInput
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    placeholder="email@domain.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <AppText style={styles.label}>Ghi chú đặc biệt</AppText>
                <TextInput
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  placeholder="Nhận phòng muộn, yêu cầu đặc biệt..."
                  style={styles.input}
                />
              </View>

              <View style={styles.summaryCard}>
                {previewLoading ? (
                  <ActivityIndicator size="small" color={colors.brandPrimary} />
                ) : previewError ? (
                  <AppText style={styles.errorText}>{previewError}</AppText>
                ) : preview ? (
                  <>
                    <View style={styles.summaryRow}>
                      <AppText style={styles.summaryLabel}>
                        Tạm tính ({preview.quantity} × {preview.duration_units})
                      </AppText>
                      <AppText style={styles.summaryVal}>
                        {formatCurrencyVnd(preview.subtotal)}
                      </AppText>
                    </View>
                    {Number(preview.promotion_discount_amount) > 0 ? (
                      <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Ưu đãi chiến dịch</AppText>
                        <AppText style={[styles.summaryVal, { color: "#059669" }]}>
                          -{formatCurrencyVnd(preview.promotion_discount_amount)}
                        </AppText>
                      </View>
                    ) : null}
                    {Number(preview.coupon_discount_amount) > 0 ? (
                      <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Mã giảm giá</AppText>
                        <AppText style={[styles.summaryVal, { color: "#059669" }]}>
                          -{formatCurrencyVnd(preview.coupon_discount_amount)}
                        </AppText>
                      </View>
                    ) : null}
                    <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                      <AppText style={styles.summaryTotalLabel}>Tổng thanh toán</AppText>
                      <AppText style={styles.summaryTotalVal}>
                        {formatCurrencyVnd(preview.total_amount)}
                      </AppText>
                    </View>
                    <View style={styles.summaryRow}>
                      <AppText style={styles.summaryLabel}>
                        Thanh toán ngay ({preview.deposit_rate}%)
                      </AppText>
                      <AppText style={[styles.summaryVal, { color: "#E11D48" }]}>
                        {formatCurrencyVnd(preview.deposit_amount)}
                      </AppText>
                    </View>
                    {preview.payment_hold_minutes > 0 ? (
                      <View style={styles.holdHint}>
                        <Clock size={13} color={colors.brandPrimary} />
                        <AppText style={styles.holdHintText}>
                          Hệ thống sẽ giữ chỗ trong {preview.payment_hold_minutes} phút để bạn thanh
                          toán.
                        </AppText>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>

              <Pressable
                disabled={submitting || previewLoading || Boolean(previewError)}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  (submitting || previewLoading || Boolean(previewError)) && { opacity: 0.6 },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <AppText style={styles.primaryBtnText}>
                  {submitting ? "Đang tạo đơn..." : "Xác nhận đặt chỗ"}
                </AppText>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  headerSub: {
    fontSize: 12.5,
    color: colors.inkSubtle,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    maxHeight: "100%",
  },
  bodyContent: {
    padding: spacing.md,
    paddingBottom: 28,
    gap: 12,
  },
  guestNotice: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    padding: 10,
  },
  guestNoticeText: {
    fontSize: 12.5,
    color: colors.brandPrimary,
    lineHeight: 18,
  },
  row2: {
    flexDirection: "row",
    gap: 10,
  },
  fieldCol: {
    flex: 1,
    gap: 4,
  },
  fieldBlock: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkPrimary,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13.5,
    color: colors.inkPrimary,
  },
  rateRow: {
    flexDirection: "row",
    gap: 8,
  },
  rateChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  rateChipActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: "#E0F2FE",
  },
  rateChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.inkBody,
  },
  rateChipTextActive: {
    color: colors.brandPrimary,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12.5,
    color: colors.inkBody,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
    marginTop: 2,
  },
  summaryTotalLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.inkPrimary,
  },
  summaryTotalVal: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  holdHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  holdHintText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.brandPrimary,
  },
  errorText: {
    fontSize: 12.5,
    color: "#E11D48",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#047857",
  },
  successDesc: {
    fontSize: 13,
    color: colors.inkBody,
    textAlign: "center",
  },
});
