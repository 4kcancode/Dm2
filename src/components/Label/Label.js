/* eslint-disable react-hooks/exhaustive-deps */

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, PageHeader } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { FieldsButton } from "../Common/FieldsButton";
import { DataView } from "../Table/Table";
import { LabelStudioContent, LabelStudioWrapper, Styles } from "./Label.styles";
import { LabelToolbar } from "./LabelToolbar";

/**
 * @param {{store: import("../../stores/AppStore").AppStore}} param1
 */
const LabelingComponent = observer(({ store }) => {
  const lsfRef = React.createRef();
  const view = store.viewsStore.selected;
  const history = store.SDK.lsf?.history;

  const [completion, setCompletion] = React.useState(
    store.SDK.lsf?.currentCompletion
  );

  const closeLabeling = () => store.closeLabeling();

  React.useEffect(() => {
    const callback = (completion) => setCompletion(completion);
    store.SDK.on("completionSet", callback);

    return () => store.SDK.off("completionSet", callback);
  }, []);

  React.useEffect(() => {
    setCompletion(store.SDK.lsf?.currentCompletion);
  }, [store.SDK.lsf?.currentCompletion?.id]);

  React.useEffect(() => {
    store.SDK.startLabeling(lsfRef.current, store.dataStore.selected);
  }, [store.dataStore.selected]);

  return (
    <Styles>
      <PageHeader
        title={
          <Button
            icon={<ArrowLeftOutlined />}
            type="link"
            onClick={closeLabeling}
            className="flex-button"
            style={{ fontSize: 18, padding: 0, color: "black" }}
          >
            Back
          </Button>
        }
        style={{ padding: 0 }}
        tags={
          store.isExplorerMode ? (
            <div style={{ paddingLeft: 20 }}>
              <FieldsButton columns={view.targetColumns} />
            </div>
          ) : (
            []
          )
        }
      >
        {store.isExplorerMode && (
          <div className="table" style={{ maxWidth: "35vw" }}>
            <DataView />
          </div>
        )}

        <LabelStudioWrapper>
          <LabelToolbar
            view={view}
            history={history}
            lsf={store.SDK.lsf?.lsf}
            completion={completion}
            isLabelStream={store.isLabelStreamMode}
          />
          <LabelStudioContent
            ref={lsfRef}
            key="label-studio"
            id="label-studio"
          />
        </LabelStudioWrapper>
      </PageHeader>
    </Styles>
  );
});

export const Labeling = inject("store")(LabelingComponent);
