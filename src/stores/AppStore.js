import { Modal, notification } from "antd";
import { flow, types } from "mobx-state-tree";
import { isDefined } from "../utils/utils";
import * as DataStores from "./DataStores";
import { DynamicModel, registerModel } from "./DynamicModel";
import { CustomJSON } from "./types";
import { ViewsStore } from "./Views";

export const AppStore = types
  .model("AppStore", {
    mode: types.optional(
      types.enumeration(["explorer", "labelstream"]),
      "explorer"
    ),

    viewsStore: types.optional(ViewsStore, {
      views: [],
    }),

    project: types.optional(CustomJSON, {}),

    loading: types.optional(types.boolean, false),

    taskStore: types.optional(
      types.late(() => {
        return DynamicModel.get("tasksStore");
      }),
      {}
    ),

    annotationStore: types.optional(
      types.late(() => {
        return DynamicModel.get("annotationsStore");
      }),
      {}
    ),

    availableActions: types.optional(types.array(CustomJSON), []),

    serverError: types.map(CustomJSON),
  })
  .views((self) => ({
    get SDK() {
      return self._sdk;
    },

    get LSF() {
      return self.SDK.lsf;
    },

    get API() {
      return self.SDK.api;
    },

    get isLabeling() {
      return !!self.dataStore?.selected || self.isLabelStreamMode;
    },

    get isLabelStreamMode() {
      return self.mode === "labelstream";
    },

    get isExplorerMode() {
      return self.mode === "explorer";
    },

    get currentView() {
      return self.viewsStore.selected;
    },

    get dataStore() {
      switch (self.target) {
        case "tasks":
          return self.taskStore;
        case "annotations":
          return self.annotationStore;
        default:
          return null;
      }
    },

    get target() {
      return self.viewsStore.selected?.target ?? "tasks";
    },

    get labelingIsConfigured() {
      return self.project?.config_has_control_tags === true;
    },
  }))
  .actions((self) => ({
    startPolling() {
      if (self._poll) return;

      const poll = async (self) => {
        await self.fetchProject();
        self._poll = setTimeout(() => poll(self), 10000);
      };

      poll(self);
    },

    beforeDestroy() {
      clearTimeout(self._poll);
    },

    setMode(mode) {
      self.mode = mode;
    },

    setTask: flow(function* ({ taskID, completionID }) {
      if (completionID !== undefined) {
        yield self.taskStore.loadTask(taskID);
        self.annotationStore.setSelected(completionID);
      } else {
        self.taskStore.setSelected(taskID);
      }
    }),

    unsetTask() {
      self.annotationStore.unset();
      self.taskStore.unset();
    },

    unsetSelection() {
      self.annotationStore.unset({ withHightlight: true });
      self.taskStore.unset({ withHightlight: true });
    },

    createDataStores() {
      const grouppedColumns = self.viewsStore.columns.reduce((res, column) => {
        res.set(column.target, res.get(column.target) ?? []);
        res.get(column.target).push(column);
        return res;
      }, new Map());

      grouppedColumns.forEach((columns, target) => {
        const dataStore = DataStores[target].create?.(columns);
        if (dataStore) registerModel(`${target}Store`, dataStore);
      });
    },

    startLabeling(item) {
      const processLabeling = () => {
        if (!item && !self.dataStore.selected) {
          self.SDK.setMode("labelstream");
          return;
        }

        if (self.dataStore.loadingItem) return;

        if (item && !item.isSelected) {
          if (isDefined(item.task_id)) {
            self.setTask({
              completionID: item.id,
              taskID: item.task_id,
            });
          } else {
            self.setTask({
              taskID: item.id,
            });
          }
        } else {
          self.closeLabeling();
        }
      };

      if (!self.labelingIsConfigured) {
        Modal.confirm({
          title: "Labeling is not configured.",
          content:
            "There are no labeling controls in the project labeling config. You need to setup it first.",
          onOk() {
            window.location.href = "./settings";
          },
          okText: "Go to setup",
        });
      } else {
        processLabeling.call(self);
      }
    },

    closeLabeling() {
      const { SDK } = self;

      self.unsetTask();
      SDK.setMode("explorer");
      SDK.destroyLSF();
    },

    fetchProject: flow(function* () {
      const oldProject = JSON.stringify(self.project ?? {});
      const newProject = yield self.apiCall("project");

      if (JSON.stringify(newProject ?? {}) !== oldProject) {
        self.project = newProject;
      }
    }),

    fetchActions: flow(function* () {
      self.availableActions = yield self.apiCall("actions");
    }),

    fetchData: flow(function* () {
      self.loading = true;

      yield self.fetchProject();
      yield self.fetchActions();
      self.viewsStore.fetchColumns();
      // self.createDataStores();
      yield self.viewsStore.fetchViews();

      self.loading = false;

      self.startPolling();
    }),

    apiCall: flow(function* (methodName, params, body) {
      let result = yield self.API[methodName](params, body);

      if (result.error && result.status !== 404) {
        if (result.response) {
          self.serverError.set(methodName, {
            error: "Something went wrong",
            response: result.response,
          });
        }

        notification.error({
          message: "Error occurred when loading data",
          description: result?.response?.detail ?? result.error,
        });
      } else {
        self.serverError.delete(methodName);
      }

      return result;
    }),

    invokeAction: flow(function* (actionId, options = {}) {
      const view = self.currentView;
      const needsLock =
        self.availableActions.findIndex((a) => a.id === actionId) >= 0;
      const { selected } = view;

      if (needsLock) view.lock();

      const actionParams = {
        ordering: view.ordering,
        selectedItems: selected.hasSelected
          ? selected.snapshot
          : { all: true, excluded: [] },
        filters: {
          conjunction: view.conjunction,
          items: view.serializedFilters,
        },
      };

      const result = yield self.apiCall(
        "invokeAction",
        {
          id: actionId,
          tabID: view.id,
        },
        {
          body: actionParams,
        }
      );

      if (options.reload !== false) {
        yield view.reload();
        self.fetchProject();
        view.clearSelection();
      }

      view.unlock();

      return result;
    }),
  }));
