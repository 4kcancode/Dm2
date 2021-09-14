import { inject, observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import { FaAngleDown } from "react-icons/fa";
import { Filters } from "../Filters/Filters";
import { Badge } from "./Badge/Badge";
import { Button } from "./Button/Button";
import { Dropdown } from "./Dropdown/Dropdown";

const buttonInjector = inject(({ store }) => {
  const { viewsStore, currentView } = store;

  return {
    viewsStore,
    sidebarEnabled: viewsStore?.sidebarEnabled ?? false,
    activeFiltersNumber: currentView?.filtersApplied ?? false,
  };
});

export const FiltersButton = buttonInjector(observer(
  React.forwardRef(({ activeFiltersNumber, size, sidebarEnabled, viewsStore, ...rest }, ref) => {
    const hasFilters = activeFiltersNumber > 0;

    return (
      <Button
        ref={ref}
        size={size}
        onClick={() => sidebarEnabled && viewsStore.toggleSidebar()}
        {...rest}
      >
        Filters {hasFilters && (
          <Badge size="small" style={{ marginLeft: 5 }}>{activeFiltersNumber}</Badge>
        )}
        <FaAngleDown size="16" style={{ marginLeft: 4 }} color="#0077FF" />
      </Button>
    );
  }),
));

const injector = inject(({ store }) => {
  return {
    sidebarEnabled: store?.viewsStore?.sidebarEnabled ?? false,
  };
});

export const FiltersPane = injector(
  observer(({ sidebarEnabled, size, ...rest }) => {
    const dropdown = useRef();

    useEffect(() => {
      if (sidebarEnabled === true) {
        dropdown?.current?.close();
      }
    }, [sidebarEnabled]);

    return (
      <Dropdown.Trigger
        ref={dropdown}
        disabled={sidebarEnabled}
        content={<Filters/>}
      >
        <FiltersButton {...rest} size={size}/>
      </Dropdown.Trigger>
    );
  }),
);
