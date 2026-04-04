import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { AppHeader } from "@/components/AppHeader";
import { NOTIFICATIONS, Notification } from "@/data/mockData";

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const typeConfig = {
    success: { color: colors.success, bg: colors.successLight },
    warning: { color: colors.warning, bg: colors.warningLight },
    alert: { color: colors.destructive, bg: "#fee2e2" },
    info: { color: colors.info, bg: colors.infoLight },
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader
        title="Notifications"
        showBack
        subtitle={`${notifications.filter(n => !n.read).length} unread`}
        rightElement={
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map(notif => {
          const tc = typeConfig[notif.type];
          return (
            <TouchableOpacity
              key={notif.id}
              onPress={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
              activeOpacity={0.85}
            >
              <Card
                variant={notif.read ? "outlined" : "elevated"}
                style={[styles.notifCard, !notif.read && { borderLeftWidth: 3, borderLeftColor: colors.primary }]}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.notifIcon, { backgroundColor: tc.bg }]}>
                    <Feather name={notif.icon as any} size={18} color={tc.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <Text style={[styles.notifTitle, { color: colors.foreground }]}>{notif.title}</Text>
                      {!notif.read && (
                        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.notifMessage, { color: colors.mutedForeground }]}>
                      {notif.message}
                    </Text>
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notif.time}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  markAll: { fontSize: 13, color: "#fff", fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  notifCard: {},
  notifRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  notifTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMessage: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
});
