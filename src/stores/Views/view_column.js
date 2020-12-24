import { getRoot, getSnapshot, types } from "mobx-state-tree";
import React from "react";
import { FaBan, FaBrain, FaCheckCircle } from "react-icons/fa";
import { all } from "../../utils/utils";

export const ViewColumnType = types.enumeration([
  "String",
  "Number",
  "Boolean",
  "Datetime",
  "List",
  "Image",
  "Audio",
  "AudioPlus",
  "Text",
  "HyperText",
  "TimeSeries",
  "Unknown",
]);

export const ViewColumn = types
  .model("ViewColumn", {
    id: types.identifier,
    title: types.string,
    alias: types.string,
    type: types.optional(ViewColumnType, "String"),
    defaultHidden: types.optional(types.boolean, false),
    parent: types.maybeNull(types.late(() => types.reference(ViewColumn))),
    children: types.maybeNull(
      types.array(types.late(() => types.reference(ViewColumn)))
    ),
    target: types.enumeration(["tasks", "annotations"]),
    width: types.optional(types.maybeNull(types.integer), null),
    orderable: types.optional(types.boolean, true),
    help: types.maybeNull(types.string),
  })
  .views((self) => ({
    get hidden() {
      if (self.children) {
        return all(self.children, (c) => c.hidden);
      } else {
        return (
          self.parentView?.hiddenColumns.hasColumn(self) ??
          (self.parent.hidden || false)
        );
      }
    },

    get parentView() {
      return getRoot(self).viewsStore.selected;
    },

    get key() {
      return self.id;
    },

    get accessor() {
      return (data) => {
        if (!self.parent) {
          const value = data[self.alias];
          return typeof value === "object" ? null : value;
        }

        try {
          const value = data?.[self.parent.alias]?.[self.alias];
          return value ?? null;
        } catch {
          console.log("Error generating accessor", {
            id: self.alias,
            parent: self.parent?.alias,
            data,
            snapshot: getSnapshot(self),
          });
          return data[self.alias];
        }
      };
    },

    get renderer() {
      return ({ value }) => {
        return value?.toString() ?? null;
      };
    },

    get canOrder() {
      return self.orderable && !self.children && !getRoot(self).isLabeling;
    },

    get order() {
      return self.parentView.currentOrder[self.id];
    },

    get asField() {
      const result = [];

      if (self.children) {
        const childColumns = [].concat(
          ...self.children.map((subColumn) => subColumn.asField)
        );
        result.push(...childColumns);
      } else {
        result.push({
          ...self,
          id: self.key,
          accessor: self.accessor,
          hidden: self.hidden,
          original: self,
        });
      }

      return result;
    },

    get icon() {
      switch (self.alias) {
        default:
          return null;
        case "total_completions":
          return <FaCheckCircle color="green" opacity="0.7" />;
        case "cancelled_completions":
          return <FaBan color="red" opacity="0.7" />;
        case "total_predictions":
          return <FaBrain color="#1890ff" opacity="0.7" />;
      }
    },
  }))
  .actions((self) => ({
    toggleVisibility() {
      self.parentView.toggleColumn(self);
    },

    setType(type) {
      self.type = type;
    },

    setWidth(width) {
      self.width = width ?? null;
      self.parentView.save();
    },

    resetWidth() {
      self.width = null;
      self.parentView.save();
    },
  }));
