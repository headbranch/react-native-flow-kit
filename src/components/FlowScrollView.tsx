import { useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { type FlowScrollViewProps, type ScrollViewRef } from '../types';
import { ScrollContext } from '../contexts/ScrollContext';

export function FlowScrollView({
  children,
  onScroll,
  scrollEventThrottle,
  ref,
  horizontal,
  ...props
}: FlowScrollViewProps) {
  const internalRef = useRef<ScrollViewRef>(null);
  const scrollOffsetRef = useRef<number>(0);
  const pendingScrollRef = useRef<{
    target: number;
    resolve: () => void;
  } | null>(null);

  const setRef = useCallback(
    (node: ScrollViewRef | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const handleScroll = useCallback(
    (e: any) => {
      scrollOffsetRef.current = horizontal
        ? e.nativeEvent.contentOffset.x
        : e.nativeEvent.contentOffset.y;

      // Settle near-zero-distance scrolls that won't trigger onMomentumScrollEnd
      if (pendingScrollRef.current) {
        const { target, resolve } = pendingScrollRef.current;
        if (Math.abs(scrollOffsetRef.current - target) < 2) {
          pendingScrollRef.current = null;
          resolve();
        }
      }

      onScroll?.(e);
    },
    [horizontal, onScroll]
  );

  const handleMomentumScrollEnd = useCallback(
    (e: any) => {
      scrollOffsetRef.current = horizontal
        ? e.nativeEvent.contentOffset.x
        : e.nativeEvent.contentOffset.y;

      if (pendingScrollRef.current) {
        pendingScrollRef.current.resolve();
        pendingScrollRef.current = null;
      }
    },
    [horizontal]
  );

  const scrollTo = useCallback(
    (target: number): Promise<void> => {
      return new Promise((resolve) => {
        const scroll = internalRef.current;
        if (!scroll) {
          resolve();
          return;
        }
        const final = Math.max(0, target);
        if (Math.abs(final - scrollOffsetRef.current) < 1) {
          resolve();
          return;
        }

        pendingScrollRef.current = { target: final, resolve };
        scroll.scrollTo({
          x: horizontal ? final : 0,
          y: horizontal ? 0 : final,
          animated: true,
        });
      });
    },
    [horizontal]
  );

  const scrollToWithOffset = useCallback(
    (getTarget: (currentOffset: number) => number): Promise<void> => {
      return scrollTo(getTarget(scrollOffsetRef.current));
    },
    [scrollTo]
  );

  return (
    <ScrollContext.Provider
      value={{
        scrollRef: internalRef,
        scrollTo: scrollToWithOffset,
        horizontal: !!horizontal,
      }}
    >
      <ScrollView
        ref={setRef}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={scrollEventThrottle ?? 16}
        horizontal={horizontal}
        {...props}
      >
        {children}
      </ScrollView>
    </ScrollContext.Provider>
  );
}
