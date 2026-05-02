import React from 'react';
import { useModals } from '../context/ModalContext';
import PlayerDetailModal from './PlayerDetailModal';
import { MatchOverviewModal } from './MatchOverviewModal';
import HeroDetailModal from './HeroDetailModal';
import TeamDetailModal from './TeamDetailModal';
import LeagueDetailModal from './LeagueDetailModal';
import { useHeroStats, useLeagues, useProTeams } from '../hooks/useOpenDota';

export default function GlobalModalContainer() {
  const { modalStack, popModal, pushModal } = useModals();
  const { data: heroesData = [] } = useHeroStats();
  const { data: leagues = [] } = useLeagues();
  const { data: teams = [] } = useProTeams();

  if (modalStack.length === 0) return null;

  return (
    <>
      {modalStack.map((item, index) => {
        const isLast = index === modalStack.length - 1;
        
        // We only want the last modal to be active, but they are all technically mounted
        // Most use Modal which is full-screen anyway.
        
        switch (item.type) {
          case 'player':
            return (
              <PlayerDetailModal
                key={`${item.type}-${item.id}-${index}`}
                visible={true}
                accountId={item.id}
                onClose={popModal}
                onMatchPress={(matchId) => pushModal('match', matchId)}
              />
            );
          case 'match':
            return (
              <MatchOverviewModal
                key={`${item.type}-${item.id}-${index}`}
                visible={true}
                matchId={item.id as number}
                onClose={popModal}
                onPushPlayer={(playerId) => pushModal('player', playerId)}
              />
            );
          case 'hero':
            return (
              <HeroDetailModal
                key={`${item.type}-${item.id}-${index}`}
                visible={true}
                hero={heroesData.find(h => h.id === Number(item.id)) || null}
                onClose={popModal}
                playerStats={item.props?.playerStats}
              />
            );
          case 'team':
            return (
              <TeamDetailModal
                key={`${item.type}-${item.id}-${index}`}
                visible={true}
                team={teams.find(t => t.team_id === Number(item.id)) || null}
                onClose={popModal}
              />
            );
          case 'league':
            return (
              <LeagueDetailModal
                key={`${item.type}-${item.id}-${index}`}
                visible={true}
                league={leagues.find(l => l.leagueid === Number(item.id)) || null}
                onClose={popModal}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
