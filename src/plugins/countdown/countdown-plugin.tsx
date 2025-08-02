import { Button } from "@anori/components/Button";
import { Input } from "@anori/components/Input";
import type {
  AnoriPlugin,
  WidgetConfigurationScreenProps,
  WidgetDescriptor,
  WidgetRenderProps,
} from "@anori/utils/user-data/types";

import "./styles.scss";
import "moment-precise-range-plugin";
import { translate } from "@anori/translations/index";
import { preciseDiffDMY } from "@anori/utils/date-diff";
import moment from "moment-timezone";
import { useState } from "react";
import { useMemo } from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
type CountdownWidgetConfigType = {
  title: string;
  countdownTo: string | null;
};

const ConfigScreen = ({
  saveConfiguration,
  currentConfig,
}: WidgetConfigurationScreenProps<CountdownWidgetConfigType>) => {
  const onConfirm = () => {
    saveConfiguration({
      title,
      countdownTo: countdownTo ? countdownTo.toISOString() : new Date().toISOString(),
    });
  };

  const { t } = useTranslation();
  const [title, setTitle] = useState(currentConfig?.title ?? "");
  const [countdownTo, setCountdownTo] = useState<Date | null>(() => {
    const stored = currentConfig?.countdownTo;
    return stored ? new Date(stored) : new Date();
  });

  return (
    <div className="CountdownWidget-config">
      <div className="field">
        <label>{t("title")}:</label>
        <Input
          placeholder={t("countdown-plugin.countdownToTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="field">
        <label>{t("countdown-plugin.countdownToDate")}:</label>
        <DatePicker withPortal selected={countdownTo} onChange={(date) => setCountdownTo(date)} />
        <Button className="save-config" onClick={onConfirm}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
};

const MainScreen = ({ config }: WidgetRenderProps<CountdownWidgetConfigType>) => {
  const { t } = useTranslation();

  const [today, _setToday] = useState(() => moment());
  const currentDate = today.clone();
  const dateTo = useMemo(() => moment(config.countdownTo), [config.countdownTo]);

  let text: string;
  if (dateTo.isSameOrBefore(currentDate)) {
    text = t("countdown-plugin.countdownOver");
  } else {
    text = preciseDiffDMY(currentDate, dateTo);
  }

  return (
    <div className="CountdownWidget">
      <div className="text">
        <h1 className="title">{config.title}</h1>
        <div className="countdown">{text}</div>
      </div>
    </div>
  );
};

const widgetDescriptor = {
  id: "countdown",
  get name() {
    return translate("countdown-plugin.widgetName");
  },
  configurationScreen: ConfigScreen,
  mainScreen: MainScreen,
  mock: () => {
    return (
      <MainScreen
        instanceId="mock"
        config={{ title: "Cool event!", countdownTo: new Date(2031, 6, 18).toISOString() }}
      />
    );
  },
  appearance: {
    size: {
      width: 2,
      height: 2,
    },
    resizable: true,
  },
} as const satisfies WidgetDescriptor<any>;

export const countdownPlugin = {
  id: "countdown-plugin",
  get name() {
    return translate("countdown-plugin.name");
  },
  widgets: [widgetDescriptor],
  configurationScreen: null,
} satisfies AnoriPlugin;
