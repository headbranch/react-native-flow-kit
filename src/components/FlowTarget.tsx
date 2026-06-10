import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type {
  ElementRect,
  TargetProps,
  SpotlightConfig,
  ViewRef,
} from '../types';
import mergeRefs from '../utils/mergeRefs';
import resolveInset from '../utils/spotlight/resolveInset';
import Tooltip from './Tooltip';
import { ScrollContext } from '../contexts/ScrollContext';
import { useFlowContext } from '../contexts/FlowContext';
import normalizeTooltipToConfig from '../utils/tooltip/normalizeTooltipToConfig';
import { useWindowDimensions } from 'react-native';

// Attempt to import react-native-svg, fall back to null if unavailable
let SvgModule: { Svg: any; Path: any } | null = null;
try {
  const svg = require('react-native-svg');
  SvgModule = {
    Svg: svg.Svg ?? svg.default?.Svg,
    Path: svg.Path ?? svg.default?.Path,
  };
} catch {
  SvgModule = null;
}

export function Target({
  step,
  provider,
  spotlight,
  tooltip,
  onOverlayPress,
  children,
  onActive,
}: TargetProps) {
  const { currentStep } = useFlowContext('Target', provider);
  const isActive = currentStep === step;
  const { width, height } = useWindowDimensions();
  const spotlightConfig: SpotlightConfig =
    typeof spotlight === 'object' ? spotlight : {};
  const { inset, color = '#000', opacity = 0.5 } = spotlightConfig;
  const tooltipConfig = normalizeTooltipToConfig(tooltip);

  const wrapperRef = useRef<ViewRef>(null);
  const [measure, setMeasure] = useState<ElementRect | null>(null);

  const { x: padX, y: padY } = resolveInset(inset);

  const scrollCtx = useContext(ScrollContext);
  const scrollRef = scrollCtx?.scrollRef ?? null;
  const scrollTo = scrollCtx?.scrollTo ?? null;
  const horizontal = scrollCtx?.horizontal ?? false;

  const scrollAndMeasure = useCallback((): Promise<void> => {
    const view = wrapperRef.current;
    const scroll = scrollRef?.current;

    return new Promise<void>((resolve) => {
      const doMeasure = () => {
        view?.measure(
          (
            _x: number,
            _y: number,
            width: number,
            height: number,
            pageX,
            pageY
          ) => {
            if (width !== 0 || height !== 0) {
              setMeasure({ x: pageX, y: pageY, width, height });
            }
            resolve();
          }
        );
      };

      if (view && scroll && scrollTo) {
        view.measure(
          (_x, _y, _width, _height, pageX: number, pageY: number) => {
            scroll.measure(
              (
                _sx,
                _sy,
                _sw,
                _sh,
                scrollPageX: number,
                scrollPageY: number
              ) => {
                const relativeOffset = horizontal
                  ? pageX - scrollPageX
                  : pageY - scrollPageY;
                scrollTo(
                  (currentOffset) => currentOffset + relativeOffset
                ).then(doMeasure);
              }
            );
          }
        );
      } else {
        doMeasure();
      }
    });
  }, [horizontal, scrollRef, scrollTo]);

  const isActiveRef = useRef(false);
  isActiveRef.current = isActive;

  useLayoutEffect(() => {
    if (!isActive) {
      setMeasure(null);
      return;
    }
    onActive?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollAndMeasure();
      });
    });
  }, [isActive, scrollAndMeasure]);

  const handleLayout = useCallback(() => {
    if (isActiveRef.current) scrollAndMeasure();
  }, [scrollAndMeasure]);

  const hole = measure && {
    x: measure.x - padX,
    y: measure.y - padY,
    w: measure.width + padX * 2,
    h: measure.height + padY * 2,
  };

  const needsModal = !!spotlight || !!tooltip;
  const justTooltip = !spotlight && !!tooltip;

  const child = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        ref: mergeRefs((children as any).ref, wrapperRef),
        collapsable: false,
        onLayout: mergeRefs((children as any).props?.onLayout, handleLayout),
        style: StyleSheet.flatten([
          (children as any).props?.style,
          isActive && { opacity: 0 },
        ]),
      })
    : children;

  const neutralisePositioning = (style: any) =>
    StyleSheet.flatten([
      style,
      {
        // position
        position: 'relative',

        // insets
        top: undefined,
        left: undefined,
        right: undefined,
        bottom: undefined,

        // margin (all longhands RN actually reads)
        margin: 0,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginHorizontal: 0,
        marginVertical: 0,
        marginStart: 0,
        marginEnd: 0,

        // transform can include translate which repositions the element
        // but we want to preserve scale/rotate for visual fidelity
        // so only strip translateX/translateY from the array
        transform: (() => {
          const flat = StyleSheet.flatten(style) as any;
          const transforms: any[] = flat?.transform ?? [];
          return transforms.filter(
            (t) => !('translateX' in t) && !('translateY' in t)
          );
        })(),

        // flex-level self-positioning that can shift the element
        // within its parent — irrelevant inside the modal wrapper
        // since the wrapper is already sized to the measurement
        alignSelf: 'auto',

        // zIndex has no effect on placement but can cause stacking
        // issues inside the modal — reset it
        zIndex: undefined,

        // elevation (Android) — modal handles its own stacking
        elevation: undefined,
      },
    ]);

  const renderOverlay = () => {
    if (!hole) return null;

    // SVG path method — single shape with a cutout, supports press on the overlay itself
    if (SvgModule) {
      const { Svg, Path } = SvgModule;
      return (
        <Svg style={StyleSheet.absoluteFillObject}>
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d={[
              `M 0 0 H ${width} V ${height} H 0 Z`,
              `M ${hole.x} ${hole.y} V ${hole.y + hole.h} H ${hole.x + hole.w} V ${hole.y} Z`,
            ].join(' ')}
            fill={justTooltip ? 'transparent' : color}
            fillOpacity={opacity}
            onPress={onOverlayPress}
          />
        </Svg>
      );
    }
    // Fallback: 4-views method
    return (
      <>
        <Pressable
          onPress={onOverlayPress}
          style={[
            {
              position: 'absolute',
              backgroundColor: justTooltip ? 'transparent' : color,
              opacity: opacity,
            },
            { top: 0, left: 0, right: 0, height: hole.y },
          ]}
        />
        <Pressable
          onPress={onOverlayPress}
          style={[
            {
              position: 'absolute',
              backgroundColor: justTooltip ? 'transparent' : color,
              opacity: opacity,
            },
            { top: hole.y + hole.h, left: 0, right: 0, bottom: 0 },
          ]}
        />
        <Pressable
          onPress={onOverlayPress}
          style={[
            {
              position: 'absolute',
              backgroundColor: justTooltip ? 'transparent' : color,
              opacity: opacity,
            },
            { top: hole.y, left: 0, width: hole.x, height: hole.h },
          ]}
        />
        <Pressable
          onPress={onOverlayPress}
          style={[
            {
              position: 'absolute',
              backgroundColor: justTooltip ? 'transparent' : color,
              opacity: opacity,
            },
            { top: hole.y, left: hole.x + hole.w, right: 0, height: hole.h },
          ]}
        />
      </>
    );
  };

  if (needsModal) {
    return (
      <>
        {child}
        <Modal
          transparent={true}
          statusBarTranslucent
          animationType="fade"
          visible={isActive}
        >
          <View style={{ flex: 1 }}>
            {renderOverlay()}

            {hole && (
              <View
                pointerEvents="box-none"
                style={{
                  position: 'absolute',
                  top: measure!.y,
                  left: measure!.x,
                  width: measure!.width,
                  height: measure!.height,
                }}
              >
                {isValidElement(children)
                  ? cloneElement(children as React.ReactElement<any>, {
                      style: neutralisePositioning(
                        (children as any).props?.style
                      ),
                    })
                  : children}
              </View>
            )}

            {measure && tooltipConfig && (
              <Tooltip config={tooltipConfig} measure={measure} />
            )}
          </View>
        </Modal>
      </>
    );
  }

  return children;
}
