import { createSelector } from 'reselect';
import { Utils } from 'manifesto.js/dist-esmodule/Utils';
import flatten from 'lodash/flatten';
import CanvasGroupings from '../../lib/CanvasGroupings';
import MiradorCanvas from '../../lib/MiradorCanvas';
import { miradorSlice } from './utils';
import { getWindow } from './getters';
import { getSequence } from './sequences';
import { getWindowViewType } from './windows';

/** */
export const selectInfoResponses = state => miradorSlice(state).infoResponses;

export const getCanvases = createSelector(
  [getSequence],
  sequence => (sequence && sequence.getCanvases()) || [],
);

/**
* Return the canvas selected by an id
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {Object}
*/
export const getCanvas = createSelector(
  [
    getSequence,
    (state, { canvasId }) => canvasId,
  ],
  (sequence, canvasId) => {
    if (!sequence || !canvasId) return undefined;

    return sequence.getCanvasById(canvasId);
  },
);

export const getCurrentCanvas = createSelector(
  [
    getSequence,
    getWindow,
  ],
  (sequence, window) => {
    if (!sequence || !window) return undefined;

    if (!window.canvasId) return sequence.getCanvasByIndex(0);

    return sequence.getCanvasById(window.canvasId);
  },
);

/** */
export const getVisibleCanvasIds = createSelector(
  [getWindow],
  window => (window && (window.visibleCanvases || (window.canvasId && [window.canvasId]))) || [],
);

/** */
export const getVisibleCanvases = createSelector(
  [getVisibleCanvasIds, getCanvases],
  (canvasIds, canvases) => (canvases || []).filter(c => canvasIds.includes(c.id)),
);

/**
* Return the current canvases grouped by how they'll appear in the viewer
* For book view returns groups of 2, for single returns 1
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {Array}
*/
const getCanvasGroupings = createSelector(
  [
    getCanvases,
    getWindowViewType,
  ],
  (canvases, view) => (canvases
      && new CanvasGroupings(
        canvases,
        view,
      ).groupings()),
);

/**
* Return the current canvases selected in a window
* For book view returns 2, for single returns 1
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {Array}
*/
export const getCanvasGrouping = createSelector(
  [
    getCanvasGroupings,
    (state, { canvasId }) => canvasId,
  ],
  (groupings, canvasId) => (groupings
      && groupings.find(group => group.some(c => c.id === canvasId))) || [],
);

/**
* Return the next canvas(es) for a window
* For book view returns 2, for single returns 1
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {Array}
*/
export const getNextCanvasGrouping = createSelector(
  [
    getCanvasGroupings,
    getCurrentCanvas,
  ],
  (groupings, canvas, view) => {
    if (!groupings || !canvas) return undefined;
    const currentGroupIndex = groupings.findIndex(group => group.some(c => c.id === canvas.id));

    if (currentGroupIndex < 0 || currentGroupIndex + 1 >= groupings.length) return undefined;
    const newGroup = groupings[currentGroupIndex + 1];

    return newGroup;
  },
);

/**
* Return the previous canvas(es) for a window
* For book view returns 2, for single returns 1
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {Array}
*/
export const getPreviousCanvasGrouping = createSelector(
  [
    getCanvasGroupings,
    getCurrentCanvas,
  ],
  (groupings, canvas, view) => {
    if (!groupings || !canvas) return undefined;

    const currentGroupIndex = groupings.findIndex(group => group.some(c => c.id === canvas.id));

    if (currentGroupIndex < 1) return undefined;
    const newGroup = groupings[currentGroupIndex - 1];

    return newGroup;
  },
);

/**
* Return canvas label, or alternatively return the given index + 1 to be displayed
* @param {object} canvas
* @return {String|Integer}
*/
export const getCanvasLabel = createSelector(
  [getCanvas],
  canvas => (canvas && (
    canvas.getLabel().length > 0
      ? canvas.getLabel().map(label => label.value)[0]
      : String(canvas.index + 1)
  )),
);

/**
* Return canvas description
* @param {object} canvas
* @param {String}
*/
export const getCanvasDescription = createSelector(
  [getCanvas],
  canvas => canvas && canvas.getProperty('description'),
);

export const getVisibleCanvasNonTiledResources = createSelector(
  [
    getVisibleCanvases,
  ],
  canvases => flatten(canvases
    .map(canvas => new MiradorCanvas(canvas).imageResources))
    .filter(resource => resource.getServices().length < 1),
);

export const selectInfoResponse = createSelector(
  [
    (state, { infoId }) => infoId,
    getCanvas,
    selectInfoResponses,
  ],
  (infoId, canvas, infoResponses) => {
    let iiifServiceId = infoId;

    if (!infoId) {
      if (!canvas) return undefined;
      const miradorCanvas = new MiradorCanvas(canvas);
      const image = miradorCanvas.iiifImageResources[0];
      iiifServiceId = image && image.getServices()[0].id;
    }

    return iiifServiceId && infoResponses[iiifServiceId]
    && !infoResponses[iiifServiceId].isFetching
    && infoResponses[iiifServiceId];
  },
);

const authServiceProfiles = {
  clickthrough: true, external: true, kiosk: true, login: true,
};
/**
 *
 */
export function selectNextAuthService({ auth }, resource, filter = authServiceProfiles) {
  const orderedAuthServiceProfiles = [
    'http://iiif.io/api/auth/1/external',
    'http://iiif.io/api/auth/1/kiosk',
    'http://iiif.io/api/auth/1/clickthrough',
    'http://iiif.io/api/auth/1/login',
  ];

  const mapFilterToProfiles = {
    'http://iiif.io/api/auth/1/clickthrough': 'clickthrough',
    'http://iiif.io/api/auth/1/external': 'external',
    'http://iiif.io/api/auth/1/kiosk': 'kiosk',
    'http://iiif.io/api/auth/1/login': 'login',
  };

  for (const profile of orderedAuthServiceProfiles) {
    const services = getServices(resource, profile);
    for (const service of services) {
      if (!auth[service.id]) {
        return filter[mapFilterToProfiles[profile]] && service;
      }

      if (auth[service.id].isFetching || auth[service.id].ok) return null;
    }
  }

  return null;
}

/** */
export function selectActiveAuthService(state, resource) {
  const orderedAuthServiceProfiles = [
    'http://iiif.io/api/auth/1/login',
    'http://iiif.io/api/auth/1/clickthrough',
    'http://iiif.io/api/auth/1/kiosk',
    'http://iiif.io/api/auth/1/external',
  ];

  for (const profile of orderedAuthServiceProfiles) {
    const services = getServices(resource, profile);
    const service = services.find(s => selectAuthStatus(state, s));
    if (service) return service;
  }

  return null;
}

export const selectCanvasAuthService = createSelector(
  [
    selectInfoResponse,
    state => state,
  ],
  (infoResponse, state) => {
    const resource = infoResponse && infoResponse.json;

    if (!resource) return undefined;

    return selectNextAuthService(state, resource)
      || selectActiveAuthService(state, resource);
  },
);

export const selectLogoutAuthService = createSelector(
  [
    selectInfoResponse,
    state => state,
  ],
  (infoResponse, state) => {
    if (!infoResponse) return undefined;
    const authService = selectActiveAuthService(state, infoResponse.json);
    if (!authService) return undefined;
    return authService.getService('http://iiif.io/api/auth/1/logout');
  },
);

/** */
export function selectAuthStatus({ auth }, service) {
  if (!service) return null;
  if (!auth[service.id]) return null;
  if (auth[service.id].isFetching) return 'fetching';
  if (auth[service.id].ok) return 'ok';
  return 'failed';
}

/** Get all the services that match a profile */
function getServices(resource, profile) {
  const services = Utils.getServices({ ...resource, options: {} });

  return services.filter(service => service.getProfile() === profile);
}
