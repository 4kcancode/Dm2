import { Button, PageHeader, Space, Tabs } from "antd";
import { inject } from "mobx-react";
import React from "react";
import { RiCloseLine } from "react-icons/ri";
import { Spinner } from "../Common/Spinner";
import { Filters } from "../Filters/Filters";
import { DataView } from "../Table/Table";
import { TablePanel } from "./tabs-panel";
import { TabTitle } from "./tabs-title";
import { TabsStyles, TabsWrapper } from "./Tabs.styles";

const sidebarInjector = inject(({ store }) => {
  return {
    viewsStore: store.viewsStore,
  };
});

const summaryInjector = inject(({ store }) => {
  return {
    tasks: store.taskStore,
    project: { ...(store.project ?? {}) },
  };
});

const switchInjector = inject(({ store }) => {
  return {
    views: store.viewsStore,
    tabs: store.viewsStore?.all ?? [],
    selectedKey: store.viewsStore?.selected?.key,
  };
});

const FiltersSidebar = sidebarInjector(({ viewsStore }) => {
  return viewsStore.sidebarEnabled && viewsStore.sidebarVisible ? (
    <div className="sidebar">
      <PageHeader
        title="Filters"
        extra={
          <Button
            key="close-filters"
            type="link"
            onClick={() => viewsStore.collapseFilters()}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <RiCloseLine size={24} />
          </Button>
        }
        style={{
          margin: "0 0 10px",
          padding: "0 10px",
          height: 24,
        }}
      />
      <Filters sidebar={true} />
    </div>
  ) : null;
});

const ProjectSummary = summaryInjector(({ tasks, project }) => {
  const cloudSync = project.target_syncing ?? project.source_syncing ?? false;
  return (
    <Space size="small" style={{ paddingRight: "1em" }}>
      {cloudSync && (
        <Space style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
          Storage sync
          <Spinner size="small" />
        </Space>
      )}
      <span
        style={{ display: "inline-flex", alignItems: "center", fontSize: 12 }}
      >
        <Space size="large">
          <span>
            Tasks: {tasks.total} / {project.task_count}
          </span>
          <span>Completions: {tasks.totalCompletions}</span>
          <span>Predictions: {tasks.totalPredictions}</span>
        </Space>
      </span>
    </Space>
  );
});

const TabsSwitch = switchInjector(({ views, tabs, selectedKey }) => {
  return (
    <Tabs
      type="editable-card"
      activeKey={selectedKey}
      onEdit={() => views.addView()}
      onChange={(key) => views.setSelected(key)}
      tabBarExtraContent={<ProjectSummary />}
      tabBarStyle={{ paddingLeft: "1em" }}
      style={{ width: "100%", maxHeight: 42 }}
    >
      {tabs.map((tab) => (
        <Tabs.TabPane
          key={tab.key}
          closable={false}
          tab={<TabTitle item={tab} />}
        />
      ))}
    </Tabs>
  );
});

export const DMTabs = () => {
  return (
    <TabsStyles>
      <TabsWrapper>
        <TabsSwitch />
        <TablePanel />
        <DataView />
      </TabsWrapper>
      <FiltersSidebar />
    </TabsStyles>
  );
};
