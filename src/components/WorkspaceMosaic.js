import React from 'react';
import PropTypes from 'prop-types';
import {
  Mosaic, MosaicWindow, getLeaves, createBalancedTreeFromLeaves,
} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import MosaicRenderPreview from '../containers/MosaicRenderPreview';
import Window from '../containers/Window';

/**
 * Represents a work area that contains any number of windows
 * @memberof Workspace
 * @private
 */
export class WorkspaceMosaic extends React.Component {
  /**
   */
  constructor(props) {
    super(props);

    this.tileRenderer = this.tileRenderer.bind(this);
    this.mosaicChange = this.mosaicChange.bind(this);
    this.determineWorkspaceLayout = this.determineWorkspaceLayout.bind(this);
    this.zeroStateView = <div />;
  }

  /** */
  componentDidMount() {
    const { updateWorkspaceMosaicLayout } = this.props;

    const newLayout = this.determineWorkspaceLayout();
    if (newLayout) updateWorkspaceMosaicLayout(newLayout);
  }

  /** */
  componentDidUpdate(prevProps) {
    const { windows, workspace, updateWorkspaceMosaicLayout } = this.props;
    if (prevProps.windows !== windows || prevProps.workspace !== workspace) {
      const newLayout = this.determineWorkspaceLayout();
      if (newLayout !== workspace.layout) updateWorkspaceMosaicLayout(newLayout);
    }
  }

  /**
   * Used to determine whether or not a "new" layout should be autogenerated.
   * If a Window is added or removed, generate that new layout and use that for
   * this render. When the Mosaic changes, that will trigger a new store update.
   */
  determineWorkspaceLayout() {
    const { windows, workspace } = this.props;
    const windowKeys = Object.keys(windows).sort();
    const leaveKeys = getLeaves(workspace.layout);
    // Check every window is in the layout, and all layout windows are present
    // in store
    if (!windowKeys.every(e => leaveKeys.includes(e))
    || !leaveKeys.every(e => windowKeys.includes(e))) {
      const newLayout = createBalancedTreeFromLeaves(windowKeys);

      return newLayout;
    }

    return workspace.layout;
  }

  /**
   * Render a tile (Window) in the Mosaic.
   */
  tileRenderer(id, path) {
    const { windows, workspace } = this.props;
    const window = windows[id];
    if (!window) return null;

    return (
      <MosaicWindow
        toolbarControls={[]}
        additionalControls={[]}
        path={path}
        windowId={window.id}
        renderPreview={() => (
          <div className="mosaic-preview">
            <MosaicRenderPreview windowId={window.id} />
          </div>
        )}
      >
        <Window
          key={`${window.id}-${workspace.id}`}
          window={window}
        />
      </MosaicWindow>
    );
  }

  /**
   * Update the redux store when the Mosaic is changed.
   */
  mosaicChange(newLayout) {
    const { updateWorkspaceMosaicLayout } = this.props;
    updateWorkspaceMosaicLayout(newLayout);
  }

  /**
   */
  render() {
    const { workspace } = this.props;
    return (
      <Mosaic
        renderTile={this.tileRenderer}
        initialValue={workspace.layout || this.determineWorkspaceLayout()}
        onChange={this.mosaicChange}
        className="mirador-mosaic"
        zeroStateView={this.zeroStateView}
      />
    );
  }
}

WorkspaceMosaic.propTypes = {
  updateWorkspaceMosaicLayout: PropTypes.func.isRequired,
  windows: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
