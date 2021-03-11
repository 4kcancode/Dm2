import { observer } from "mobx-react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBan,
  FaCheck,
  FaCheckCircle,
  FaCog,
  FaInfoCircle,
  FaRedo,
  FaTrashAlt,
  FaUndo
} from "react-icons/fa";
import { Block, Elem } from "../../../utils/bem";
import { Button } from "../../Common/Button/Button";
import { Icon } from "../../Common/Icon/Icon";
import { Space } from "../../Common/Space/Space";
import { Tooltip } from "../../Common/Tooltip/Tooltip";
import "./Toolbar.styl";

const TOOLTIP_DELAY = 0.8;

export const Toolbar = observer(({ view, history, lsf, isLabelStream }) => {
  const annotation = lsf?.annotationStore?.selected;

  const task = view.dataStore.selected;

  const { viewingAllAnnotations, viewingAllPredictions } =
    lsf?.annotationStore ?? {};

  const viewAll = viewingAllAnnotations || viewingAllPredictions;

  return lsf?.noTask === false && task ? (
    <Block name="label-toolbar" mod={{ labelStream: isLabelStream }}>
      <Elem name="task">
        <Space size="large">
          <div style={{ display: "flex", alignItems: "center" }}>
            <History history={history}>
              <div style={{ margin: history ? "0 10px" : 0 }}>
                Task #{task.id}
              </div>
            </History>
          </div>

          {!viewAll && <LSFOperations history={annotation?.history} />}
        </Space>
      </Elem>

      {!!lsf && !!annotation && annotation.type === "annotation" && (
        <Elem name="actions">
          {!viewAll && (
            <SubmissionButtons
              lsf={lsf}
              annotation={annotation}
              isLabelStream={isLabelStream}
              disabled={lsf.isLoading}
            />
          )}

          <Elem name="tools">
            <Space>
              <Tooltip title="ML Assisted Labeling">
                <Button
                  look={lsf.showingDescription ? "primary" : "dashed"}
                  ghost={lsf.showingDescription}
                  icon={<Icon icon={FaInfoCircle} />}
                  onClick={() => lsf.toggleDescription()}
                />
              </Tooltip>

              <Tooltip title="Settings">
                <Button
                  look="dashed"
                  icon={<Icon icon={FaCog} />}
                  onClick={() => lsf.toggleSettings()}
                />
              </Tooltip>
            </Space>
          </Elem>
        </Elem>
      )}
    </Block>
  ) : null;
});

const LSFOperations = observer(({ history }) => {
  useHotkeys("ctrl+z,cmd+z", () => history?.undo(), { keyup: false }, [
    history,
  ]);
  useHotkeys(
    "ctrl+shift+z,cmd+shift+z",
    () => history?.redo(),
    { keyup: false },
    [history]
  );

  return history ? (
    <Button.Group>
      <Button
        icon={<Icon icon={FaUndo} />}
        disabled={!history.canUndo}
        onClick={() => history.undo()}
      />
      <Button
        icon={<Icon icon={FaRedo} />}
        disabled={!history.canRedo}
        onClick={() => history.redo()}
      />
      <Button
        icon={<Icon icon={FaTrashAlt} />}
        disabled={!history.canUndo}
        onClick={() => history.reset()}
      />
    </Button.Group>
  ) : null;
});

const SubmissionButtons = observer(
  ({ lsf, annotation, isLabelStream, disabled }) => {
    const { userGenerate, sentUserGenerate } = annotation;
    const isNewTask = userGenerate && !sentUserGenerate;

    const saveAnnotation = React.useCallback(() => {
      if (!disabled) {
        isNewTask ? lsf.submitAnnotation() : lsf.updateAnnotation();
      }
    }, [disabled, isNewTask, lsf]);

    const skipTask = React.useCallback(() => {
      if (!disabled) {
        lsf.skipTask();
      }
    }, [disabled, lsf]);

    const buttons = [];

    buttons.push(
      <Tooltip
        key="skip"
        title="Mark task as cancelled: [ Ctrl+Space ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button
          look="danger"
          onClick={skipTask}
          disabled={disabled}
          icon={<Icon icon={FaBan} />}
        >
          Skip
        </Button>
      </Tooltip>
    );

    buttons.push(
      <Tooltip
        key="submit"
        title="Save results: [ Ctrl+Enter ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button
          look="primary"
          disabled={disabled}
          icon={<Icon icon={isNewTask ? FaCheck : FaCheckCircle} />}
          onClick={saveAnnotation}
        >
          {isNewTask || isLabelStream ? "Submit" : "Update"}
        </Button>
      </Tooltip>
    );

    useHotkeys("cmd+alt+enter", saveAnnotation, { keyup: false }, [
      disabled,
    ]);
    useHotkeys("ctrl+space,cmd+alt+ ", skipTask, { keyup: false }, [disabled]);

    return <Space>{buttons}</Space>;
  }
);

const HistoryButton = ({ children, ...rest }) => (
  <Button {...rest} shape="circle">
    {children}
  </Button>
);

/**
 *
 * @param {{root: HTMLElement, history: import("../../../sdk/lsf-history").LSFHistory}} param0
 */
const History = observer(({ history, children }) => {
  const [canGoBack, setGoBack] = React.useState(false);
  const [canGoForward, setGoForward] = React.useState(false);
  const [renderable, setRenderable] = React.useState(false);

  React.useEffect(() => {
    if (history) {
      history.onChange(() => {
        setGoBack(history.canGoBack);
        setGoForward(history.canGoForward);
      });
      setRenderable(true);
    }
  }, [history]);

  return renderable ? (
    <React.Fragment>
      <HistoryButton
        disabled={!canGoBack}
        onClick={() => history.goBackward()}
        icon={<Icon icon={FaArrowLeft} />}
      />
      {children}
      <HistoryButton
        disabled={!canGoForward}
        onClick={() => history.goForward()}
        icon={<Icon icon={FaArrowRight} />}
      />
    </React.Fragment>
  ) : (
    children
  );
});
