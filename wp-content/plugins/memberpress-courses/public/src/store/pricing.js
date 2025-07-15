const initialState = MPCS_Course_Data.pricing;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_PRICING":
      return Object.assign({}, state, {
      });
    default:
      return state;
  }
};

const actions = {
  updatePricing(setting, value) {
    return {
      type: "UPDATE_PRICING",
    };
  },
};

const controls = {
};

const selectors = {
  getAll(state) {
    return state;
  },
};

const resolvers = {
  *getAll() {
    return;
  },
};

export const StoreKey = "memberpress/course/pricing";
export const StoreConfig = {
  selectors,
  actions,
  reducer,
  resolvers,
  controls: { ...wp.data.controls, ...controls },
};
