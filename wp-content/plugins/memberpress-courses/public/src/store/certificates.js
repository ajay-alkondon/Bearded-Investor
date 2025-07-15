const initialState = MPCS_Course_Data.settings;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_SETTINGS":
      return Object.assign({}, state, {
        [action.setting]: {
          ...state[action.setting],
          value: action.value
        },
      });
    default:
      return state;
  }
};

const actions = {
  updateSettings(setting, value) {
    return {
      type: "UPDATE_SETTINGS",
      setting,
      value
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

export const StoreKey = "memberpress/course/certificates";
export const StoreConfig = {
  selectors,
  actions,
  reducer,
  resolvers,
  controls: { ...wp.data.controls, ...controls },
};
