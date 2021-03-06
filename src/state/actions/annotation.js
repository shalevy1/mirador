import ActionTypes from './action-types';

/**
 * requestAnnotation - action creator
 *
 * @param  {String} targetId
 * @param  {String} annotationId
 * @memberof ActionCreators
 */
export function requestAnnotation(targetId, annotationId) {
  return {
    annotationId,
    targetId,
    type: ActionTypes.REQUEST_ANNOTATION,
  };
}

/**
 * receiveAnnotation - action creator
 *
 * @param  {String} targetId
 * @param  {String} annotationId
 * @param  {Object} annotationJson
 * @memberof ActionCreators
 */
export function receiveAnnotation(targetId, annotationId, annotationJson) {
  return {
    annotationId,
    annotationJson,
    targetId,
    type: ActionTypes.RECEIVE_ANNOTATION,
  };
}

/**
 * receiveAnnotationFailure - action creator
 *
 * @param  {String} targetId
 * @param  {String} annotationId
 * @param  {String} error
 * @memberof ActionCreators
 */
export function receiveAnnotationFailure(targetId, annotationId, error) {
  return {
    annotationId,
    error,
    targetId,
    type: ActionTypes.RECEIVE_ANNOTATION_FAILURE,
  };
}

/**
 * selectAnnotation - action creator
 *
 * @param  {String} windowId
 * @param  {String} targetId
 * @param  {String} annotationId
 * @memberof ActionCreators
 */
export function selectAnnotation(windowId, annotationId) {
  return {
    annotationId,
    type: ActionTypes.SELECT_ANNOTATION,
    windowId,
  };
}

/**
 * deselectAnnotation - action creator
 *
 * @param  {String} windowId
 * @param  {String} targetId
 * @param  {String} annotationId
 * @memberof ActionCreators
 */
export function deselectAnnotation(windowId, annotationId) {
  return {
    annotationId,
    type: ActionTypes.DESELECT_ANNOTATION,
    windowId,
  };
}

/**
 * toggleAnnotationDisplay - action creator
 *
 * @param  {String} windowId
 * @memberof ActionCreators
 */
export function toggleAnnotationDisplay(windowId) {
  return {
    type: ActionTypes.TOGGLE_ANNOTATION_DISPLAY, windowId,
  };
}

/**
 * toggleAnnotationDisplay - action creator
 *
 * @param  {String} windowId
 * @memberof ActionCreators
 */
export function hoverAnnotation(windowId, annotationIds) {
  return {
    annotationIds, type: ActionTypes.HOVER_ANNOTATION, windowId,
  };
}
