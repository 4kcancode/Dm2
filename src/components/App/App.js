import { observer, Provider } from "mobx-react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Spinner } from "../Common/Spinner";
import { Labeling } from "../Label/Label";
import { DMTabs } from "../Tabs/tabs";
import { Styles } from "./App.styles";

/** @typedef {import("../../stores/AppStore").AppStore} AppStore */

class ErrorBoundary extends React.Component {
  state = {
    error: null,
  };

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    return this.state.error ? (
      <div className="error">{this.state.error}</div>
    ) : (
      this.props.children
    );
  }
}

/**
 * Main Component
 * @param {{app: AppStore} param0
 */
const AppComponent = ({ app }) => {
  // make full screen for label stream
  const rootStyle =
    app.SDK.mode === "labelstream"
      ? {
          position: "absolute",
          width: "100%",
          top: 0,
          "z-index": 1000,
        }
      : null;

  useHotkeys("w,shift+up", () => {
    if (document.activeElement !== document.body) return;
    app.dataStore.focusPrev();
  });

  useHotkeys("a,shift+left", () => {
    if (document.activeElement !== document.body) return;

    if (app.dataStore.selected) app.closeLabeling();
  });

  useHotkeys("s,shift+down", () => {
    if (document.activeElement !== document.body) return;

    app.dataStore.focusNext();
  });

  useHotkeys("d,shift+right,enter", () => {
    if (document.activeElement !== document.body) return;

    const { highlighted } = app.dataStore;
    if (highlighted) app.startLabeling(highlighted);
  });

  return (
    <ErrorBoundary>
      <Provider store={app}>
        <Styles fullScreen={app.isLabeling} style={rootStyle}>
          {app.loading ? (
            <div className="app-loader">
              <Spinner size="large" />
            </div>
          ) : app.isLabeling ? (
            <Labeling />
          ) : (
            <DMTabs />
          )}
        </Styles>
      </Provider>
    </ErrorBoundary>
  );
};

export const App = observer(AppComponent);
