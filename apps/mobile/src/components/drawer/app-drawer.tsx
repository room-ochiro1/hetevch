import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DrawerPanel } from '@/components/drawer/drawer-panel';
import { DrawerRail } from '@/components/drawer/drawer-rail';
import { useTheme } from '@/hooks/use-theme';

type AppDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Side menu that slides in from the right (under the avatar that opens it) over everything,
 * tab bar included. Closes on a tap outside, the back button, or a swipe to the right.
 * Navigation waits until it has slid away.
 */
export function AppDrawer({ open, onClose }: AppDrawerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth - 48, 340);
  const [progress] = useState(() => new Animated.Value(0));
  const [mounted, setMounted] = useState(false);
  /** Runs once the drawer has closed, e.g. pushing the screen the user picked. */
  const afterClose = useRef<(() => void) | null>(null);

  // Mount before the slide-in starts; unmount only after the slide-out finished.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 260 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || open) return;
      setMounted(false);
      const next = afterClose.current;
      afterClose.current = null;
      next?.();
    });
  }, [open, mounted, progress]);

  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => progress.setValue(Math.min(1, Math.max(0, 1 - g.dx / width))),
        onPanResponderRelease: (_, g) => {
          if (g.dx > width / 3 || g.vx > 0.5) onClose();
          else Animated.spring(progress, { toValue: 1, useNativeDriver: true }).start();
        },
      }),
    [progress, width, onClose],
  );

  function go(after?: () => void) {
    afterClose.current = after ?? null;
    onClose();
  }

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [width, 0] });
  const scrim = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Цэс хаах"
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        {...swipe.panHandlers}
        accessibilityViewIsModal
        style={[
          styles.drawer,
          {
            width,
            backgroundColor: theme.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX }],
          },
        ]}>
        <DrawerRail go={go} />
        <DrawerPanel go={go} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    // Rail on the outer (right) edge, like the left-hand original mirrored.
    flexDirection: 'row-reverse',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    overflow: 'hidden',
  },
});
