import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

export default function NotificationModal({
  visible,
  notification,
  onClose,
  onOpenAction,
}) {
  if (!notification) return null;

  const title = notification.title || 'Notification Details';
  const body = notification.body || notification.message || '';
  const date = notification.created_at || notification.date
    ? new Date(notification.created_at || notification.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Just now';
  const actionUrl = notification.data?.url || notification.url;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications" size={22} color="#FF6B00" />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Campus Ninja Notice</Text>
                <Text style={styles.dateText}>{date}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={26} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.notifTitle}>{title}</Text>
            <Text style={styles.notifBody}>{body}</Text>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            {actionUrl ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onClose();
                  if (onOpenAction) onOpenAction(actionUrl);
                  else Linking.openURL(actionUrl).catch(() => {});
                }}
              >
                <Text style={styles.actionButtonText}>Open Link / Resource</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
                <Text style={styles.dismissText}>Close Notification</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '80%',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B00',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  contentScroll: {
    marginVertical: 18,
  },
  notifTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    lineHeight: 24,
  },
  notifBody: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 22,
  },
  footer: {
    paddingTop: 10,
  },
  actionButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dismissButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});
