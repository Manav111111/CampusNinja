import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ToastContext = createContext({
  showToast: () => {},
});

// Event emitter for static calls
const listeners = new Set();
export const Toast = {
  show: (options) => {
    listeners.forEach((listener) => listener(options));
  },
};

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toastConfig, setToastConfig] = useState(null);
  const [slideAnim] = useState(new Animated.Value(120));
  const [opacityAnim] = useState(new Animated.Value(0));

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastConfig(null);
    });
  }, [slideAnim, opacityAnim]);

  const showToast = useCallback(({ type = 'success', title, message, duration = 3000, actionText, onAction }) => {
    setToastConfig({ type, title, message, actionText, onAction });
    slideAnim.setValue(120);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
  }, [slideAnim, opacityAnim, hideToast]);

  useEffect(() => {
    listeners.add(showToast);
    return () => {
      listeners.delete(showToast);
    };
  }, [showToast]);

  const getTheme = (type) => {
    switch (type) {
      case 'error':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: 'close-circle', iconColor: '#EF4444' };
      case 'warning':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: 'warning', iconColor: '#F59E0B' };
      case 'info':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: 'information-circle', iconColor: '#3B82F6' };
      case 'success':
      default:
        return { bg: '#0F172A', border: '#1E293B', text: '#FFFFFF', icon: 'checkmark-circle', iconColor: '#10B981' };
    }
  };

  const currentTheme = toastConfig ? getTheme(toastConfig.type) : getTheme('success');

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastConfig && (
        <Animated.View
          style={[
            styles.container,
            {
              bottom: Math.max(insets.bottom + 16, 24),
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Ionicons name={currentTheme.icon} size={24} color={currentTheme.iconColor} style={styles.icon} />
          
          <View style={styles.textContainer}>
            {!!toastConfig.title && (
              <Text style={[styles.title, { color: currentTheme.text }]}>{toastConfig.title}</Text>
            )}
            {!!toastConfig.message && (
              <Text style={[styles.message, { color: toastConfig.type === 'success' ? '#94A3B8' : currentTheme.text }]} numberOfLines={2}>
                {toastConfig.message}
              </Text>
            )}
          </View>

          {!!toastConfig.actionText && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (toastConfig.onAction) toastConfig.onAction();
                hideToast();
              }}
            >
              <Text style={styles.actionText}>{toastConfig.actionText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
            <Ionicons name="close" size={18} color={toastConfig.type === 'success' ? '#64748B' : currentTheme.text} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
