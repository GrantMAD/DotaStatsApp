import React from 'react';
import { Modal, ModalProps, View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface GlassModalProps extends ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function GlassModal({
  visible,
  onClose,
  children,
  ...props
}: GlassModalProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
      {...props}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{ flex: 1 }}
        className="bg-black/40"
      >
        {/* Tap outside to close */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* 🔥 FIXED MODAL CONTAINER */}
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(100)}
          style={{
            maxHeight: '92%',   // ✅ instead of height
            flexGrow: 1         // ✅ allows expansion properly
          }}
          className="w-full bg-zinc-900/60 rounded-t-[40px] overflow-hidden border-t border-white/10"
        >
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Handle */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1.5 bg-white/20 rounded-full" />
          </View>

          {/* 🔥 CRITICAL FIX */}
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}