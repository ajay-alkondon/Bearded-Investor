const initialState = MPCS_Course_Data.settings;
const reducer = (state = initialState, action) => {
  // console.log(action.type);
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
    // Map through object to reduce it
    // const settings = Object.entries(state).reduce((newObj, [key, setting]) => {
    //   newObj[key] = setting.value;
    //   return newObj;
    // }, {});

    return state;
  },
};

const resolvers = {
  *getAll() {
    return;
  },
};

export const StoreKey = "memberpress/course/settings";
export const StoreConfig = {
  selectors,
  actions,
  reducer,
  resolvers,
  controls: { ...wp.data.controls, ...controls },
};
