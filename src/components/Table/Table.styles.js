import styled from "styled-components";

export const TableStyles = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  .dm-content {
    &__statusbar {
      display: flex;
      align-items: center;
      padding: 10px 0;
    }

    &__table {
      flex: 1;
      display: flex;
      height: 100%;
      width: 100%;
      flex-direction: column;
      box-shadow: 0 0 0 1px #f0f0f0 inset;
    }

    &__table-body {
      flex: 1;
      height: 100%;
    }

    &__table-header {
      flex: 0;
      z-index: 10;
      position: sticky;
      background-color: #fafafa;
      box-shadow: 0 -0.5px 0 0.5px #f0f0f0 inset;
    }

    &__table-row,
    &__table-heading {
      display: flex;
      z-index: 1;
    }

    &__table-row {
      cursor: pointer;
      position: relative;
    }

    &__table-row.selected,
    &__table-row:hover {
      z-index: 100;
      background-color: #f3f9ff;
    }

    &__table-row.selected {
      pointer-events: none;
    }

    &__table-row:not(.selected).highlighted::after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: "";
      z-index: 100;
      position: absolute;
      pointer-events: none;
      box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.8) inset;
    }

    &__table-header {
      font-weight: 500;
    }

    &__table-cell,
    &__table-header {
      flex: 1;
      display: flex;
      padding: 10px;
      min-width: 50px;
      overflow: hidden;
      align-items: center;
      box-sizing: border-box;
      border-collapse: collapse;
      box-shadow: 0.5px 0.5px 0 0.5px #f0f0f0 inset;
    }

    .selected &__table-cell {
      box-shadow: 0.5px 0.5px 0 0.5px #deefff inset;
    }
  }

  .data-variable {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__orderable {
      cursor: pointer;
    }
  }
`;
