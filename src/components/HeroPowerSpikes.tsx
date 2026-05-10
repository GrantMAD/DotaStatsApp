import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useHeroDurations } from '../hooks/useOpenDota';
import { LineChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HeroPowerSpikes({ heroId }: { heroId: number }) {
  const { data: durations = [], isLoading } = useHeroDurations(heroId);

  const chartData = useMemo(() => {
    const sorted = [...durations].sort((a, b) => a.duration_bin - b.duration_bin);
    if (sorted.length === 0) return null;

    return {
      labels: sorted.map(d => `${Math.floor(d.duration_bin / 60)}m`),
      datasets: [
        {
          data: sorted.map(d => (d.wins / d.games_played) * 100),
          color: (opacity = 1) => `rgba(0, 255, 136, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [durations]);

  if (isLoading) {
    return <ActivityIndicator size="small" color="#8b5cf6" style={{ marginVertical: 20 }} />;
  }

  if (!chartData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>NO DURATION DATA FOUND</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>POWER SPIKES</Text>
          <Text style={styles.subtitle}>Win Rate by Game Duration</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LIVE META</Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={SCREEN_WIDTH - 32} // Padding
        height={220}
        chartConfig={{
          backgroundColor: '#0d0d1a',
          backgroundGradientFrom: '#1e1e2e',
          backgroundGradientTo: '#1e1e2e',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 255, 136, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#0d0d1a',
          },
          propsForLabels: {
            fontSize: 10,
            fontWeight: '700',
          },
        }}
        bezier
        style={{
          marginVertical: 16,
          borderRadius: 16,
          paddingRight: 40, // Adjust for Y labels
        }}
        yAxisSuffix="%"
        withInnerLines={false}
        withOuterLines={false}
        fromZero={false}
      />

      <View style={styles.footer}>
        <View style={styles.legend}>
          <View style={styles.dot} />
          <Text style={styles.legendText}>Win Rate %</Text>
        </View>
        <Text style={styles.footerNote}>Trend over last 30 days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  subtitle: {
    color: '#666',
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  badgeText: {
    color: '#00ff88',
    fontSize: 8,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff88',
  },
  legendText: {
    color: '#666',
    fontSize: 8,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  footerNote: {
    color: '#666',
    fontSize: 8,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: '#1e1e2e',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    fontStyle: 'italic',
  },
});
