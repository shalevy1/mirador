import { createSelector } from 'reselect';
import { miradorSlice } from './utils';

/** */
export function getWorkspace(state) {
  return miradorSlice(state).workspace;
}

/** */
export function getElasticLayout(state) {
  return miradorSlice(state).elasticLayout;
}

export const getFullScreenEnabled = createSelector(
  [getWorkspace],
  workspace => workspace.isFullscreenEnabled,
);

/** Returns the latest error from the state
 * @param {object} state
 */
export function getLatestError(state) {
  const [errorId] = miradorSlice(state).errors.items;

  return miradorSlice(state).errors[errorId];
}

export const getWorkspaceType = createSelector(
  [getWorkspace],
  ({ type }) => type,
);
