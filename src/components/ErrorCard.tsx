import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry: () => void;
  icon?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ 
  title = "Something went wrong", 
  message, 
  onRetry, 
  icon = "alert-circle" 
}) => {
  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={{
        margin: 20,
        padding: 24,
        backgroundColor: '#1e1e2e',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#3f3f5e',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2d2d44',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Ionicons name={icon as any} size={32} color="#ef4444" />
      </View>
      
      <Text style={{
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center'
      }}>
        {title}
      </Text>
      
      <Text style={{
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24
      }}>
        {message}
      </Text>
      
      <TouchableOpacity 
        onPress={onRetry}
        activeOpacity={0.7}
        style={{
          backgroundColor: '#8b5cf6',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Ionicons name="refresh" size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Try Again</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ErrorCard;
