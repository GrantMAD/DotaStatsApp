import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  users?: {
    id: string;
    steam_account_id: string;
    steam_name: string;
    email: string;
  };
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  related_user_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_steam_id: string;
  created_at: string;
}

export const useFriends = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('friendships')
        .select('*, requester:requester_id(*), addressee:addressee_id(*)')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      return (data || []).map((f: any) => ({
        ...f,
        users: f.requester_id === user.id ? f.addressee : f.requester
      }));
    },
    enabled: !!user,
  });

  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const followMutation = useMutation({
    mutationFn: async (steamAccountId: string) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, followed_steam_id: steamAccountId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      Toast.show({ type: 'success', text1: 'Player followed!' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Failed to follow user', text2: error.message });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (steamAccountId: string) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_steam_id', steamAccountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      Toast.show({ type: 'success', text1: 'Player unfollowed' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Failed to unfollow user', text2: error.message });
    }
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: user.id, addressee_id: addresseeId, status: 'pending' });
      if (error) throw error;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Friend request sent!' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Failed to send request', text2: error.message });
    }
  });

  const isFollowing = (steamAccountId: string) => {
    return following.some(f => f.followed_steam_id === steamAccountId.toString());
  };

  const isFriend = (targetUserId: string) => {
    return friends.some(f => f.requester_id === targetUserId || f.addressee_id === targetUserId);
  };

  return { 
    friends, 
    following, 
    loading: friendsLoading || followingLoading, 
    fetchFriends: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
    }, 
    sendFriendRequest: sendFriendRequestMutation.mutate,
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowing,
    isFriend
  };
};

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    // Use a unique name to avoid conflicts between multiple components using this hook
    const channelName = `notifications_${user.id}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const handleFriendRequestMutation = useMutation({
    mutationFn: async ({ notification, accept }: { notification: AppNotification, accept: boolean }) => {
      if (!user || !notification.related_user_id) return;
      
      const newStatus = accept ? 'accepted' : 'declined';
      const { error: fError } = await supabase
        .from('friendships')
        .update({ status: newStatus })
        .eq('requester_id', notification.related_user_id)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (fError) throw fError;

      const { error: nError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);
      
      if (nError) throw nError;

      return { accept };
    },
    onSuccess: (data) => {
      if (data?.accept) {
        queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      Toast.show({
        type: 'success',
        text1: data?.accept ? 'Friend request accepted' : 'Friend request declined'
      });
    }
  });

  return { 
    notifications, 
    unreadCount, 
    loading: isLoading,
    markAsRead: markAsReadMutation.mutate, 
    markAllAsRead: markAllAsReadMutation.mutate, 
    handleFriendRequest: (notification: AppNotification, accept: boolean) => 
      handleFriendRequestMutation.mutate({ notification, accept }), 
    fetchNotifications: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }) 
  };
};

