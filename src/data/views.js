export default [{
  title: "Tasks",
  fields: [
      // tasks
      { field: "id", source: "tasks", enabled: true, filterState: { numValue: 0 } },
      { field: "task_status", source: "tasks", enabled: true, canToggle: true, filterState: { stringValue: "" } },
      { field: "annotations", source: "tasks", enabled: true, canToggle: true },
      { field: "created", source: "tasks", enabled: true, canToggle: true },
      
      // annotations
      { field: "annotation_id", source: "annotations", enabled: true, canToggle: false },
      { field: "task_id", source: "annotations", enabled: true, canToggle: false },
      { field: "annotation_status", source: "annotations", enabled: true, canToggle: false },
      { field: "created", source: "annotations", enabled: true, canToggle: true },
      { field: "updated", source: "annotations", enabled: true, canToggle: true },
      { field: "author", source: "annotations", enabled: false, canToggle: true },
      { field: "regions", source: "annotations", enabled: true, canToggle: true },
      
      // add some file fields
  ]
}];
