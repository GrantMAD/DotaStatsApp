import React from 'react';
import { useModals } from '../context/ModalContext';
import PlayerDetailModal from './PlayerDetailModal';
import { MatchOverviewModal } from './MatchOverviewModal';
import HeroDetailModal from './HeroDetailModal';
import TeamDetailModal from './TeamDetailModal';
import LeagueDetailModal from './LeagueDetailModal';
import { useHeroStats, useLeagues, useProTeams } from '../hooks/useOpenDota';
import ErrorBoundary from './ErrorBoundary';

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
              <ErrorBoundary key={`${item.type}-${item.id}-${index}`}>
                <PlayerDetailModal
                  visible={true}
                  accountId={item.id}
                  onClose={popModal}
                  onMatchPress={(matchId) => pushModal('match', matchId)}
                />
              </ErrorBoundary>
            );
          case 'match':
            return (
              <ErrorBoundary key={`${item.type}-${item.id}-${index}`}>
                <MatchOverviewModal
                  visible={true}
                  matchId={item.id as number}
                  onClose={popModal}
                  onPushPlayer={(playerId) => pushModal('player', playerId)}
                />
              </ErrorBoundary>
            );
          case 'hero':
            return (
              <ErrorBoundary key={`${item.type}-${item.id}-${index}`}>
                <HeroDetailModal
                  visible={true}
                  hero={heroesData.find(h => h.id === Number(item.id)) || null}
                  onClose={popModal}
                  playerStats={item.props?.playerStats}
                />
              </ErrorBoundary>
            );
          case 'team':
            return (
              <ErrorBoundary key={`${item.type}-${item.id}-${index}`}>
                <TeamDetailModal
                  visible={true}
                  team={teams.find(t => t.team_id === Number(item.id)) || null}
                  onClose={popModal}
                />
              </ErrorBoundary>
            );
          case 'league':
            return (
              <ErrorBoundary key={`${item.type}-${item.id}-${index}`}>
                <LeagueDetailModal
                  visible={true}
                  league={leagues.find(l => l.leagueid === Number(item.id)) || null}
                  onClose={popModal}
                />
              </ErrorBoundary>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
