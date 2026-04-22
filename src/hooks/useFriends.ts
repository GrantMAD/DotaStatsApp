import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import Toast from 'react-native-toast-message';

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

export const useFriends = () => {
  const { user } = useSupabaseAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    
    // We want friendships where status is 'accepted' and user is either requester or addressee.
    // Supabase JS doesn't easily let us join on either/or for foreign keys natively without a view,
    // so we fetch where auth.uid() is involved, then process.
    const { data, error } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(*), addressee:addressee_id(*)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
      console.error('Error fetching friends:', error);
    } else {
      // Map to a consistent 'users' property for the friend
      const formatted = (data || []).map((f: any) => ({
        ...f,
        users: f.requester_id === user.id ? f.addressee : f.requester
      }));
      setFriends(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, addressee_id: addresseeId, status: 'pending' });

    if (error) {
      console.error('Error sending request:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send request',
        text2: error.message
      });
      return false;
    }
    
    Toast.show({
      type: 'success',
      text1: 'Friend request sent!'
    });
    return true;
  };

  return { friends, loading, fetchFriends, sendFriendRequest };
};

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Realtime subscription - use a unique channel name per hook instance
    const channelName = `notifications_changes_${user.id}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
      
    if (!error) {
      fetchNotifications();
    }
  };

  const handleFriendRequest = async (notification: AppNotification, accept: boolean) => {
    if (!user || !notification.related_user_id) return;
    
    // Update friendship
    const newStatus = accept ? 'accepted' : 'declined';
    const { error: fError } = await supabase
      .from('friendships')
      .update({ status: newStatus })
      .eq('requester_id', notification.related_user_id)
      .eq('addressee_id', user.id)
      .eq('status', 'pending');

    if (fError) {
      console.error('Error updating friendship:', fError);
      return;
    }

    Toast.show({
      type: 'success',
      text1: accept ? 'Friend request accepted' : 'Friend request declined'
    });

    // Mark notification as read
    await markAsRead(notification.id);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, handleFriendRequest, fetchNotifications };
};
