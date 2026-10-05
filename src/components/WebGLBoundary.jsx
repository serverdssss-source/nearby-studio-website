import { Component } from 'react';

// Decorative WebGL effects throw when a browser (or a search-engine renderer)
// has no WebGL. Without this boundary React unmounts the whole page.
export default class WebGLBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
