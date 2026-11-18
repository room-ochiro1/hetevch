import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PadKey } from '@/components/home/use-amount-pad';
import { Icon } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DIGIT_ROWS: readonly (readonly PadKey[])[] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

type KeypadProps = {
  onKey: (key: PadKey) => void;
  /** Long press on ⌫ clears everything. */
  onClear: () => void;
  /** Dollars get a "." key; tögrög get "000". */
  decimal: boolean;
};

/** A phone-style number pad: big targets, no system keyboard. */
export function Keypad({ onKey, onClear, decimal }: KeypadProps) {
  const rows: (readonly PadKey[])[] = [...DIGIT_ROWS, [decimal ? '.' : '000', '0', 'back']];

  return (
    <View style={styles.pad}>
      {rows.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((key) => (
            <Key key={key} value={key} onPress={() => onKey(key)} onLongPress={key === 'back' ? onClear : undefined} />
          ))}
        </View>
      ))}
    </View>
  );
}

const LABELS: Partial<Record<PadKey, string>> = {
  '000': 'Гурван тэг',
  '.': 'Цэг',
  back: 'Сүүлийн тоог устгах',
};

function Key({ value, onPress, onLongPress }: { value: PadKey; onPress: () => void; onLongPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={LABELS[value] ?? value}
      accessibilityHint={value === 'back' ? 'Удаан дарвал бүгдийг арилгана' : undefined}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.key, pressed && { backgroundColor: theme.backgroundElement }]}>
      {value === 'back' ? (
        <Icon name="backspace" color={theme.text} size={28} />
      ) : (
        <Text style={[styles.label, { color: theme.text }]}>{value}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  key: {
    flex: 1,
    height: 60,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 30, fontWeight: 600, fontVariant: ['tabular-nums'] },
});
