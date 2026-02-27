import { createApp, computed, ref, provide, h, shallowRef, readonly } from "vue";
import AppStandalone from "./AppStandalone.vue";
import PriceCheckWindow from "./web/price-check/PriceCheckWindow.vue";
import * as I18n from "./web/i18n";
import * as Data from "./assets/data";
import { initConfig, AppConfig } from "./web/Config";
import { Host } from "./web/background/IPC";
import { usePoeninja } from "./web/background/Prices";
import { useLeagues } from "./web/background/Leagues";
import type { WidgetManager } from "./web/overlay/interfaces";

(async function () {
  await initConfig();
  const i18nPlugin = await I18n.init(AppConfig().language);
  await Data.init(AppConfig().language);
  await Host.init();

  await useLeagues().load();
  const { queuePricesFetch } = usePoeninja();
  queuePricesFetch();

  const pcWidget = AppConfig().widgets.find((w) => w.wmType === "price-check")!;
  pcWidget.wmWants = "show";

  const size = (() => {
    const s = shallowRef({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", () => {
      s.value = { width: window.innerWidth, height: window.innerHeight };
    });
    return readonly(s);
  })();

  const app = createApp({
    components: { AppStandalone, PriceCheckWindow },
    setup() {
      const wm: WidgetManager = {
        poePanelWidth: computed(() => 0),
        size,
        active: ref(true),
        widgets: computed(() => AppConfig().widgets),
        show(wmId: number) {
          const w = AppConfig().widgets.find((_) => _.wmId === wmId);
          if (w) w.wmWants = "show";
        },
        hide(wmId: number) {
          const w = AppConfig().widgets.find((_) => _.wmId === wmId);
          if (w) w.wmWants = "hide";
        },
        remove() {},
        bringToTop() {},
        create() {},
        setFlag(wmId: number, flag: string, state: boolean) {
          const w = AppConfig().widgets.find((_) => _.wmId === wmId);
          if (!w) return;
          const has = w.wmFlags.includes(flag);
          if (state && !has) w.wmFlags.push(flag);
          if (!state && has) w.wmFlags = w.wmFlags.filter((_) => _ !== flag);
        },
      };
      provide<WidgetManager>("wm", wm);
      return () => h(AppStandalone, null, {
        default: () => h(PriceCheckWindow, { config: pcWidget }),
      });
    },
  });
  app.use(i18nPlugin);
  app.mount("#app");
})();
