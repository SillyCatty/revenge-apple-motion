(() => {
  "use strict";

  const RUBBER_BAND_COEFFICIENT = 0.55;

  function rubberBand(pull, dimension, coefficient = RUBBER_BAND_COEFFICIENT) {
    if (dimension <= 0 || pull === 0) return 0;
    const offset = (1 - 1 / ((coefficient * Math.abs(pull)) / dimension + 1)) * dimension;
    return pull < 0 ? -offset : offset;
  }

  const AppleSpringConfig = {
    smooth: { stiffness: 280, damping: 30, mass: 1 },
    snappy: { stiffness: 350, damping: 28, mass: 1 },
    bouncy: { stiffness: 400, damping: 24, mass: 1 },
  };

  let unpatches = [];

  const plugin = {
    onLoad: () => {
      try {
        const vendetta = window.vendetta;
        if (!vendetta) {
          console.warn("[AppleMotion] Vendetta/Revenge global not found.");
          return;
        }

        const { findByProps } = vendetta.metro;
        const { instead } = vendetta.patcher;

        const Animated = findByProps("spring", "timing", "decay");
        if (Animated && Animated.spring) {
          unpatches.push(
            instead("spring", Animated, (args, orig) => {
              const [value, config] = args;
              const patchedConfig = Object.assign({}, config, {
                useNativeDriver: config.useNativeDriver !== undefined ? config.useNativeDriver : true,
                stiffness: config.stiffness || AppleSpringConfig.smooth.stiffness,
                damping: config.damping || AppleSpringConfig.smooth.damping,
                mass: config.mass || AppleSpringConfig.smooth.mass,
              });
              return orig(value, patchedConfig);
            })
          );
        }

        console.log("[AppleMotion] Plugin initialized with Apple spring dynamics.");
      } catch (err) {
        console.error("[AppleMotion] Initialization error:", err);
      }
    },

    onUnload: () => {
      for (const unpatch of unpatches) {
        try {
          unpatch();
        } catch (_) {}
      }
      unpatches = [];
      console.log("[AppleMotion] Plugin unloaded.");
    },
  };

  return plugin;
})();
