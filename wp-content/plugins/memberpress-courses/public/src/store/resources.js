import apiFetch from '@wordpress/api-fetch';

const initialState = MPCS_Course_Data.resources || {};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_SETTINGS":
      return Object.assign({}, state, {
        [action.setting]: {
          ...state[action.setting],
          value: action.value
        },
      });
    case "UPDATE_SECTION":
      return Object.assign({}, state, {
        sections: action.newSections,
      });
    case "ADD_RESOURCE":
      return Object.assign({}, state, {
        items: action.items,
        sections: {
          ...state.sections,
          [action.section.id]: action.section,
        },
      });
    case "MOVE_ITEMS_IN_SECTION":
      console.log('action.section :>> ', action.section);
      return Object.assign({}, state, {
        sections: {
          ...state.sections,
          [action.section.id]: action.section,
        },
      });
    case "FETCH_DOWNLOADS":
      return Object.assign({}, state, {
        query: action.downloads
      });
    case "FAIL_RESOLUTION":
      // for debuggin, if resolution fails, check browser console
      console.log('ERROR: :>> ', action);
    default:
      return state;
  }
};

const actions = {
  *filterDownloads(search = "") {
    const args = {
      number: 8,
      s: search,
      post_status: ['publish', 'draft', 'future']
    }
    const path = getPathString(MPCS_Course_Data.api.resources, args);
    const downloads = yield actions.fetchFromAPI({ path });

    if(downloads){
      return {
        type: "FETCH_DOWNLOADS",
        downloads: downloads,
        totalPages: downloads.meta.max,
      };
    }
    return;
  },
  fetchFromAPI(args) {
    return {
      type: "FETCH_FROM_API",
      args,
    };
  },
  updateSettings(setting, value) {
    return {
      type: "UPDATE_SETTINGS",
      setting,
      value
    };
  },
  updateSection(newSections) {
    return {
      type: "UPDATE_SECTION",
      newSections,
    };
  },
  addResource(item, sectionId, resources) {

    // let items = resources.items;
    const _item = {[item.id]: item};

    const items = {
      ...resources.items,
      ..._item
    };

    const sectionItems = resources.sections[sectionId].items;
    sectionItems.push(item.id);

    const section = {
      ...resources.sections[sectionId],
      items: sectionItems,
    };

    return {
      type: "ADD_RESOURCE",
      items,
      section,
    };
  },
  removeResource(index, id, sectionId, resources) {

    // Remove lesson from Sections
    const sectionItems = resources.sections[sectionId].items;
    sectionItems.splice(index, 1);

    const section = {
      ...resources.sections[sectionId],
      items: sectionItems,
    };

    let items = resources.items;
    delete items[id]

    return {
      type: "ADD_RESOURCE",
      items,
      section,
    };
  },
  reorderItems(section, items) {
    console.log('section :>> ', section);
    console.log('items :>> ', items);

    section = {
      ...section,
      items: items,
    };

    return {
      type: "MOVE_ITEMS_IN_SECTION",
      section,
    };
  },

};

const controls = {
  FETCH_FROM_API(action) {
    return apiFetch(action.args);
  },
};

const selectors = {
  getAll(state) {
    return state;
  },
  fetchDownloads(state, search = "") {
    return state.query || {downloads:[], meta:[]};
  }
};

const resolvers = {
  *getAll() {
    return;
  },
  /**
   * This resolver is used to hydrate the state.query property
   * @param {string} search
   * @returns
   */
  *fetchDownloads(search = "") {
    return yield actions.filterDownloads();
  },
};

const getPathString = (path, args) => {
  args = Object.keys(args).map(function (key) {
    return key + '=' + args[key];
  }).join('&');
  return path + '?' + args;
};


export const StoreKey = "memberpress/course/resources";
export const StoreConfig = {
  selectors,
  actions,
  reducer,
  resolvers,
  controls: { ...wp.data.controls, ...controls },
};
