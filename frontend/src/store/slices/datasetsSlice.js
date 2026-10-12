import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";
import { getApiErrorMessage } from "../../utils/apiErrors";

// --------------------
// Async thunks (CRUD)
// --------------------

// R: list
export const fetchDatasets = createAsyncThunk(
  "datasets/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/datasets");
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur de chargement des datasets."));
    }
  }
);

// C: persist already-parsed CSV/JSON rows as the Dataset JSON document.
export const createDataset = createAsyncThunk(
  "datasets/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/datasets/upload", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de l'import du dataset."));
    }
  }
);

// U: update metadata (name, description, etc.)
// Expected backend: PUT /datasets/:id
export const updateDataset = createAsyncThunk(
  "datasets/update",
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/datasets/${id}`, patch);
      return res.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la mise à jour du dataset."));
    }
  }
);

// U: archive/unarchive
export const archiveDataset = createAsyncThunk(
  "datasets/archive",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/datasets/${id}/archive`);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de l'archivage du dataset."));
    }
  }
);

export const unarchiveDataset = createAsyncThunk(
  "datasets/unarchive",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/datasets/${id}/unarchive`);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la restauration du dataset."));
    }
  }
);

// D: delete
export const deleteDataset = createAsyncThunk(
  "datasets/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/datasets/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Erreur lors de la suppression du dataset."));
    }
  }
);

const datasetsSlice = createSlice({
  name: "datasets",
  initialState: {
    list: [],
    activeDataset: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    setActiveDataset: (state, action) => {
      state.activeDataset = action.payload;
    },
    clearDatasetsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchDatasets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDatasets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDatasets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Erreur de chargement";
      })

      // create
      .addCase(createDataset.pending, (state) => {
        state.error = null;
      })
      .addCase(createDataset.fulfilled, (state, action) => {
        // on ajoute en tête
        state.list = [action.payload, ...state.list];
      })
      .addCase(createDataset.rejected, (state, action) => {
        state.error = action.payload || "Erreur d'import";
      })

      // update
      .addCase(updateDataset.fulfilled, (state, action) => {
        const updated = action.payload;
        state.list = state.list.map((d) => (d.id === updated.id ? updated : d));
        if (state.activeDataset?.id === updated.id) {
          state.activeDataset = updated;
        }
      })
      .addCase(updateDataset.rejected, (state, action) => {
        state.error = action.payload || "Erreur de mise à jour";
      })

      // archive/unarchive
      .addCase(archiveDataset.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((d) => d.id !== id);
        if (state.activeDataset?.id === id) state.activeDataset = null;
      })
      .addCase(archiveDataset.rejected, (state, action) => {
        state.error = action.payload || "Erreur d'archivage";
      })
      .addCase(unarchiveDataset.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.map((d) =>
          d.id === id ? { ...d, archived: false } : d
        );
      })
      .addCase(unarchiveDataset.rejected, (state, action) => {
        state.error = action.payload || "Erreur de restauration";
      })

      // delete
      .addCase(deleteDataset.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((d) => d.id !== id);
        if (state.activeDataset?.id === id) state.activeDataset = null;
      })
      .addCase(deleteDataset.rejected, (state, action) => {
        state.error = action.payload || "Erreur suppression";
      });
  },
});

export const { setActiveDataset, clearDatasetsError } = datasetsSlice.actions;
export default datasetsSlice.reducer;
