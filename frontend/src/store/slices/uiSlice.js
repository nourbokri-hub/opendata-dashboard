import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    // Search used in Sources de données list
    searchTerm: "",

    // Visualisation state (the page also persists it per dataset in localStorage)
    vizState: {
      datasetId: null,
      xKey: null,
      yKey: null,
      chartType: "bar",
      searchRows: "",
      filterCol: null,
      filterOp: "contains", // contains | equals | gt | lt
      filterVal: "",
      aggregate: true,
      aggFn: "sum", // sum | avg | count
    },
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setVizState: (state, action) => {
      state.vizState = { ...state.vizState, ...action.payload };
    },
    resetVizState: (state) => {
      state.vizState = {
        datasetId: null,
        xKey: null,
        yKey: null,
        chartType: "bar",
        searchRows: "",
        filterCol: null,
        filterOp: "contains",
        filterVal: "",
        aggregate: true,
        aggFn: "sum",
      };
    },
  },
});

export const { setSearchTerm, setVizState, resetVizState } = uiSlice.actions;
export default uiSlice.reducer;
