import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { AppHeader } from "@/components/AppHeader";
import { CHAT_MESSAGES, ChatMessage } from "@/data/mockData";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const [text, setText] = useState("");
  const flatRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMsg: ChatMessage = {
      id: `msg${Date.now()}`,
      senderId: "s001",
      senderName: "Aye Mya Thaw",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      type: "text",
    };
    setMessages(prev => [...prev, newMsg]);
    setText("");
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageRow, item.isOwn && styles.messageRowOwn]}>
      {!item.isOwn && (
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.senderName.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </Text>
        </View>
      )}
      <View style={styles.messageBubbleWrap}>
        {!item.isOwn && (
          <Text style={[styles.senderName, { color: colors.mutedForeground }]}>{item.senderName}</Text>
        )}
        <View style={[
          styles.bubble,
          item.isOwn
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        ]}>
          <Text style={[styles.bubbleText, { color: item.isOwn ? "#fff" : colors.foreground }]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.mutedForeground }, item.isOwn && { textAlign: "right" }]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      <AppHeader
        title="Agent Chat"
        showBack
        subtitle="Ko Zin Min • Online"
        rightElement={<Feather name="phone" size={20} color="#fff" />}
      />

      <KeyboardAvoidingView
        style={styles.kbContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messageList]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={[styles.chatHeader, { backgroundColor: colors.primaryLight }]}>
              <Feather name="lock" size={12} color={colors.primary} />
              <Text style={[styles.chatHeaderText, { color: colors.primary }]}>
                Secure conversation with your assigned agent
              </Text>
            </View>
          }
        />

        <View style={[
          styles.inputRow,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 8,
          },
        ]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
            activeOpacity={0.8}
          >
            <Feather name="send" size={18} color={text.trim() ? "#fff" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kbContainer: { flex: 1 },
  messageList: { padding: 16, gap: 12, paddingBottom: 8 },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  chatHeaderText: { fontSize: 12 },
  messageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageRowOwn: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "700" },
  messageBubbleWrap: { maxWidth: "75%", gap: 2 },
  senderName: { fontSize: 11, marginBottom: 2, marginLeft: 4 },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, marginHorizontal: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
