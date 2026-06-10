import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MatchDetails, Peer } from '../../services/types';
import { DraftDisplay } from './DraftDisplay';
import { PlayerRow } from './PlayerRow';

interface ScoreboardTabProps {
  matchData: MatchDetails;
  userPeers: Peer[];
  draftAdvantage: number;
  parseRequested: boolean;
  isParsing: boolean;
  onRequestParse: () => void;
  onPushPlayer?: (id: number) => void;
}

export const ScoreboardTab: React.FC<ScoreboardTabProps> = ({
  matchData,
  userPeers,
  draftAdvantage,
  parseRequested,
  isParsing,
  onRequestParse,
  onPushPlayer,
}) => {
  return (
    <>
      {!matchData.version && (
        <View className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-6 flex-row items-center">
          <View className="bg-amber-500/20 p-2 rounded-full mr-4">
            <Ionicons name="alert-circle" size={20} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Incomplete Analysis</Text>
            <Text className="text-gray-400 text-[10px] leading-relaxed">Economy charts and timeline events require parsing.</Text>
          </View>
          {!parseRequested ? (
            <TouchableOpacity
              onPress={onRequestParse}
              disabled={isParsing}
              className="bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30"
            >
              {isParsing ? (
                <ActivityIndicator size="small" color="#f59e0b" />
              ) : (
                <Text className="text-amber-500 text-[9px] font-black uppercase">Start Parse</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View className="items-end">
              <View className="flex-row items-center bg-green-500/10 px-2 py-1.5 rounded-lg">
                <ActivityIndicator size="small" color="#22c55e" style={{ transform: [{ scale: 0.6 }] }} />
                <Text className="text-green-500 text-[8px] font-black uppercase ml-1">Polling...</Text>
              </View>
              <Text className="text-gray-500 text-[7px] font-bold mt-1 uppercase italic">This may take a few minutes</Text>
            </View>
          )}
        </View>
      )}
      {matchData.picks_bans && (
        <DraftDisplay
          picksBans={matchData.picks_bans}
          gameMode={matchData.game_mode}
          draftAdvantage={draftAdvantage}
        />
      )}
      <View className="mb-6">
        <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} className="px-4 py-2 rounded-t-xl border-l-2 border-win mb-1">
          <Text className="text-win font-bold uppercase text-[10px] tracking-widest italic">Radiant Dominion</Text>
        </LinearGradient>
        <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
          {matchData.players.filter(p => p.player_slot < 128).map((p, i) => (
            <PlayerRow
              key={p.player_slot}
              player={p}
              index={i}
              peer={p.account_id ? userPeers.find(up => up.account_id === p.account_id) : null}
              onPushPlayer={onPushPlayer}
            />
          ))}
        </View>
      </View>
      <View className="mb-6">
        <LinearGradient colors={['rgba(239, 68, 68, 0.15)', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} className="px-4 py-2 rounded-t-xl border-l-2 border-loss mb-1">
          <Text className="text-loss font-bold uppercase text-[10px] tracking-widest italic">Dire Authority</Text>
        </LinearGradient>
        <View className="bg-[#222] rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
          {matchData.players.filter(p => p.player_slot >= 128).map((p, i) => (
            <PlayerRow
              key={p.player_slot}
              player={p}
              index={i}
              peer={p.account_id ? userPeers.find(up => up.account_id === p.account_id) : null}
              onPushPlayer={onPushPlayer}
            />
          ))}
        </View>
      </View>
    </>
  );
};
