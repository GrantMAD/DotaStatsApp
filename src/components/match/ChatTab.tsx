import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchDetails } from '../../services/types';
import { getHeroImageUrl } from '../../services/constants';
import { getChatWheelPhrase } from '../../services/chatwheel';
import { ParseInstructions } from './ParseInstructions';

interface ChatTabProps {
  matchData: MatchDetails;
  parseRequested: boolean;
  isParsing: boolean;
  onRequestParse: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  matchData,
  parseRequested,
  isParsing,
  onRequestParse,
}) => {
  const [showChatWheel, setShowChatWheel] = useState(true);

  if (!matchData.chat) {
    return (
      <ParseInstructions
        matchId={matchData.match_id}
        message="Chat logs are only available for parsed matches. This includes all-chat messages and chat wheel usage."
        parseRequested={parseRequested}
        isParsing={isParsing}
        onRequestParse={onRequestParse}
      />
    );
  }

  const filteredChat = showChatWheel
    ? matchData.chat
    : matchData.chat.filter(msg => {
      const phrase = getChatWheelPhrase(msg.key);
      return msg.type !== 'chatwheel' && phrase === msg.key;
    });

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3 pr-1">
        <Text className="text-gray-400 uppercase tracking-widest text-[10px] font-bold pl-1">Match Chat Log</Text>
        <TouchableOpacity
          onPress={() => setShowChatWheel(!showChatWheel)}
          className={`flex-row items-center px-2 py-1 rounded-md border ${showChatWheel ? 'bg-gamingAccent/10 border-gamingAccent/30' : 'bg-zinc-800 border-zinc-700'}`}
        >
          <Ionicons name={showChatWheel ? "eye-outline" : "eye-off-outline"} size={12} color={showChatWheel ? "#8b5cf6" : "#71717a"} />
          <Text className={`text-[9px] font-bold ml-1.5 ${showChatWheel ? 'text-gamingAccent' : 'text-gray-500'}`}>
            {showChatWheel ? 'WHEEL ON' : 'WHEEL OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {filteredChat.length === 0 ? (
        <View className="bg-[#2a2a2a] p-10 rounded-xl items-center">
          <Ionicons name="chatbubbles-outline" size={32} color="#4b5563" />
          <Text className="text-gray-500 text-xs mt-2">No matching messages found.</Text>
        </View>
      ) : (
        <View className="bg-[#2a2a2a] rounded-xl p-2 border border-zinc-800">
          {filteredChat.map((msg, idx) => {
            const player = matchData.players.find(p => p.player_slot === msg.player_slot);
            const minutes = Math.floor(msg.time / 60);
            const seconds = String(Math.abs(msg.time % 60)).padStart(2, '0');
            const isRadiant = msg.player_slot !== undefined && msg.player_slot < 128;
            const phrase = getChatWheelPhrase(msg.key);
            const isWheel = msg.type === 'chatwheel' || (phrase !== msg.key);

            return (
              <View key={idx} className={`flex-row items-start py-2 px-2 ${idx !== filteredChat.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                <View className="w-12 pt-0.5">
                  <Text className="text-gray-500 font-bold text-[9px]">{msg.time < 0 ? '-' : ''}{Math.abs(minutes)}:{seconds}</Text>
                </View>
                {player && (
                  <Image source={{ uri: getHeroImageUrl(player.hero_id) }} className="w-7 h-5 rounded-sm mr-2 mt-0.5" />
                )}
                <View className="flex-1">
                  <View className="flex-row items-baseline flex-wrap">
                    <Text className={`text-[11px] font-bold ${isRadiant ? 'text-win' : 'text-loss'}`}>
                      {msg.unit || player?.personaname || 'Anonymous'}:
                    </Text>
                    <View className="flex-row items-baseline flex-1 ml-1.5">
                      {isWheel && <Text className="text-gamingAccent font-bold text-[11px] mr-1">{'>'}</Text>}
                      <Text className={`text-[11px] leading-4 ${isWheel ? 'italic text-gamingAccent' : 'text-white'}`}>
                        {phrase}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
